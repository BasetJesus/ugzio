import { prisma } from "@/lib/db";
import { scoreAndPersist } from "@/services/risk.service";
import { recordAnalyticsSnapshot } from "@/services/case-study.service";
import { schedulePsychologicalSequence, schedulePreDeliveryConfirm } from "@/lib/zioconfirm/service";
import { canTransition } from "@/lib/zioconfirm/state-machine";
import { emitCritical } from "@/lib/events/queues";
import { emit } from "@/lib/events/event-bus";
import { EventType } from "@/lib/events/taxonomy";
import { alertSeller, refusedAlert } from "@/lib/alerts/seller";
import { scheduleD3UgcAsk } from "@/lib/zioconfirm/service";
import { resolveDeliveryOutcome } from "@/services/attribution.service";
import { recordJourneyEvent } from "@/services/buyer-journey.service";
import { addEvent } from "@/services/operation-timeline.service";
import { JOURNEY_EVENT_TYPES } from "@/types/journey";
import { FREE_TIER_LIMIT } from "@/lib/constants";
import type { OrderStatus, OrderSummary, RiskLevel, DeliveryState, PaymentStatus, OrderTableItem, OrdersPageData } from "@/types/order";

async function ensureActivationEvent(orgId: string, eventType: string) {
  try {
    const existing = await prisma.activationEvent.findFirst({
      where: { organizationId: orgId, eventType },
    });
    if (!existing) {
      await prisma.activationEvent.create({
        data: { organizationId: orgId, eventType },
      });
    }
  } catch (e) {
    console.error("[order.service] ensureActivationEvent failed:", e);
  }
}

const EMPTY_ORDERS: OrderSummary[] = [];

export async function listOrders(orgId: string): Promise<OrderSummary[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return orders.map((o) => ({
      id: o.id,
      buyerName: o.buyerName,
      buyerPhone: o.buyerPhone,
      buyerWilaya: o.buyerWilaya,
      product: o.product,
      amount: Number(o.amount),
      riskLevel: o.riskLevel as OrderSummary["riskLevel"],
      trustScore: o.trustScore,
      status: o.status as OrderStatus,
      createdAt: o.createdAt.toISOString(),
    }));
  } catch {
    return EMPTY_ORDERS;
  }
}

export async function getOrderDetail(orgId: string, orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
      include: {
        conversations: {
          include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
          take: 1,
        },
        ugcItems: true,
        timeline: { orderBy: { scheduledFor: "asc" } },
      },
    });
    return order;
  } catch {
    return null;
  }
}

export async function checkFreePlanLimit(orgId: string): Promise<boolean> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { subscriptionStatus: true, maxOrdersPerMonth: true },
    });
    if (!org) return true;
    if (org.subscriptionStatus !== "free") return false;

    const monthlyCount = await prisma.order.count({
      where: {
        organizationId: orgId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    return monthlyCount >= Math.min(org.maxOrdersPerMonth, FREE_TIER_LIMIT);
  } catch {
    return true;
  }
}

export async function createOrder(orgId: string, data: {
  buyerName: string;
  buyerPhone: string;
  product?: string;
  amount: number;
  buyerWilaya?: string;
}) {
  try {
    const order = await prisma.order.create({
      data: {
        organizationId: orgId,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
        product: data.product ?? null,
        buyerWilaya: data.buyerWilaya ?? null,
        amount: Number(data.amount),
        status: "CREATED",
      },
    });

    try {
      await scoreAndPersist(data.buyerPhone, orgId, data.buyerName, order.id);
    } catch (e) {
      console.error("[order.service] Risk scoring failed:", e);
    }

    try {
      await schedulePsychologicalSequence(order.id);
    } catch (e) {
      console.error("[order.service] Psychological sequence scheduling failed:", e);
    }

    const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    try {
      await schedulePreDeliveryConfirm(order.id, estimatedDelivery);
    } catch (e) {
      console.error("[order.service] Pre-delivery confirm scheduling failed:", e);
    }

    await emitCritical(EventType.ORDER_CREATED, { orderId: order.id, orgId });

    emit(EventType.ORDER_CREATED, {
      orderId: order.id,
      orgId,
      buyerName: data.buyerName,
      buyerPhone: data.buyerPhone,
      amount: Number(data.amount),
      product: data.product ?? null,
    });

    await ensureActivationEvent(orgId, "FIRST_ORDER_CREATED");
    await recordAnalyticsSnapshot(orgId, "baseline");

    return order;
  } catch (e) {
    console.error("[order.service] createOrder failed:", e);
    return null;
  }
}

async function closeOperationalLoop(orgId: string, orderId: string, terminalStatus: OrderStatus, order: { buyerPhone: string; buyerName: string; amount: number }) {
  try {
    const isSuccess = terminalStatus === "UGC_RECEIVED"
    const outcome = isSuccess ? "SUCCESS" : "FAILURE"

    // 1. Update BuyerIdentity counters
    if (isSuccess) {
      await prisma.buyerIdentity.upsert({
        where: { anonymizedId: order.buyerPhone },
        update: { successfulOrders: { increment: 1 }, totalOrders: { increment: 1 } },
        create: { anonymizedId: order.buyerPhone, successfulOrders: 1, totalOrders: 1, riskScore: 50, networkMlScore: 50 },
      })
    } else {
      await prisma.buyerIdentity.upsert({
        where: { anonymizedId: order.buyerPhone },
        update: { failedOrders: { increment: 1 }, totalOrders: { increment: 1 } },
        create: { anonymizedId: order.buyerPhone, failedOrders: 1, totalOrders: 1, riskScore: 50, networkMlScore: 50 },
      })
    }

    // 2. Create AIEvaluation record (learning signal)
    await prisma.aIEvaluation.create({
      data: {
        organizationId: orgId,
        insightId: `loop_${orderId}_${Date.now()}`,
        recommendationType: `ORDER_${outcome}`,
        wasActedOn: true,
        outcomeAfter14d: outcome,
        sellerRating: isSuccess ? 5 : 1,
      },
    })

    // 3. Emit completion event
    emit(EventType.ORDER_COMPLETED, {
      orderId,
      orgId,
      status: terminalStatus,
      buyerName: order.buyerName,
      buyerPhone: order.buyerPhone,
      amount: Number(order.amount),
      outcome,
    })
  } catch (e) {
    console.error("[order.service] closeOperationalLoop failed:", e)
  }
}

export async function transitionOrderStatus(orgId: string, orderId: string, newStatus: OrderStatus) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
    });
    if (!order) return { success: false };

    const previousStatus = order.status;

    if (!canTransition(previousStatus as never, newStatus as never)) {
      return { success: false };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    emit(EventType.ORDER_STATUS_CHANGED, {
      orderId,
      orgId,
      previousStatus,
      newStatus,
      buyerName: order.buyerName,
    });

    if (newStatus === "DELIVERED" || newStatus === "REFUSED") {
      await resolveDeliveryOutcome(orgId, orderId, newStatus)
    }

    if (newStatus === "DELIVERED") {
      await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.ORDER_DELIVERED)
      await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.DELIVERY_SUCCESS)
      await addEvent(orgId, orderId, "delivery.completed", "system", {
        newStatus: "DELIVERED",
        orderAmount: Number(order.amount),
        deliverySuccessScore: order.trustScore >= 70 ? 90 : order.trustScore >= 40 ? 60 : 40,
        deliveryExperienceState: order.trustScore >= 70 ? "highly_satisfied" : order.trustScore >= 40 ? "satisfied" : "neutral",
      })
      await scheduleD3UgcAsk(orderId);
    }

    if (newStatus === "UGC_REQUESTED") {
      await addEvent(orgId, orderId, "ugc.requested", "system", {
        orderAmount: Number(order.amount),
      })
    }

    if (newStatus === "UGC_RECEIVED") {
      await addEvent(orgId, orderId, "ugc.received", "system", {
        orderAmount: Number(order.amount),
      })
      await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.UGC_RECEIVED, {
        method: "whatsapp",
      })
      await closeOperationalLoop(orgId, orderId, "UGC_RECEIVED", order)
    }

    if (newStatus === "REFUSED") {
      await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.BUYER_REFUSED)
      await alertSeller(orgId, refusedAlert(order.buyerName));
      await closeOperationalLoop(orgId, orderId, "REFUSED", order)
    }

    if (newStatus === "INTELLIGENT_CANCEL") {
      await closeOperationalLoop(orgId, orderId, "INTELLIGENT_CANCEL", order)
    }

    return { success: true, id: orderId, status: newStatus };
  } catch {
    return { success: false };
  }
}

export async function getOrdersPageData(orgId: string): Promise<OrdersPageData> {
  try {
  const orders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const tableItems: OrderTableItem[] = orders.map((o) => ({
    id: o.id,
    customer: { name: o.buyerName, phone: o.buyerPhone, wilaya: o.buyerWilaya },
    product: o.product,
    amount: Number(o.amount),
    status: o.status as OrderStatus,
    riskLevel: o.riskLevel as RiskLevel,
    trustScore: o.trustScore,
    paymentStatus: paymentFromStatus(o.status as OrderStatus),
    deliveryState: deliveryFromStatus(o.status as OrderStatus),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.createdAt.toISOString(),
  }));

  const now = new Date();
  const today = tableItems.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const atRisk = tableItems.filter((o) => o.riskLevel === "high" || o.deliveryState === "at_risk").length;
  const totalAmount = tableItems.reduce((s, o) => s + o.amount, 0);
  const delivered = tableItems.filter((o) => o.deliveryState === "delivered").length;

  return {
    stats: {
      total: tableItems.length,
      atRisk,
      pendingToday: today,
      revenueTotal: Math.round(totalAmount * 100) / 100,
      deliveredRate: tableItems.length > 0 ? Math.round((delivered / tableItems.length) * 100) : 0,
    },
    orders: tableItems,
  };
  } catch {
    return {
      stats: { total: 0, atRisk: 0, pendingToday: 0, revenueTotal: 0, deliveredRate: 0 },
      orders: [],
    };
  }
}

function paymentFromStatus(status: OrderStatus): PaymentStatus {
  if (status === "DELIVERED" || status === "BUYER_CONFIRMED") return "confirmed";
  if (status === "REFUSED" || status === "INTELLIGENT_CANCEL") return "failed";
  if (status === "CREATED" || status === "PRE_SHIPPING_CONFIRM_SENT") return "pending";
  return "confirmed";
}

function deliveryFromStatus(status: OrderStatus): DeliveryState {
  switch (status) {
    case "DELIVERED": case "UGC_REQUESTED": case "UGC_RECEIVED": return "delivered";
    case "SHIPPED": return "on_time";
    case "REFUSED": return "returned";
    case "INTELLIGENT_CANCEL": case "PENDING_RESCHEDULE": return "at_risk";
    default: return "delayed";
  }
}

export async function getOrdersCountByRisk(orgId: string): Promise<{ total: number; highRisk: number; todayOrders: number }> {
  try {
    const { getOrderCountsByRisk } = await import("@/services/risk.service");
    return await getOrderCountsByRisk(orgId);
  } catch {
    return { total: 0, highRisk: 0, todayOrders: 0 };
  }
}

import { prisma } from "@/lib/db";
import { scoreAndPersist } from "@/services/risk.service";
import { schedulePsychologicalSequence, schedulePreDeliveryConfirm } from "@/lib/zioconfirm/service";
import { canTransition } from "@/lib/zioconfirm/state-machine";
import { emitCritical } from "@/lib/events/queues";
import { emit } from "@/lib/events/event-bus";
import { alertSeller, refusedAlert } from "@/lib/alerts/seller";
import { scheduleD3UgcAsk } from "@/lib/zioconfirm/service";
import { FREE_TIER_LIMIT } from "@/lib/constants";
import type { OrderStatus, OrderSummary, RiskLevel, DeliveryState, PaymentStatus, OrderTableItem, OrdersPageData } from "@/types/order";

async function ensureActivationEvent(orgId: string, eventType: string) {
  const existing = await prisma.activationEvent.findFirst({
    where: { organizationId: orgId, eventType },
  });
  if (!existing) {
    await prisma.activationEvent.create({
      data: { organizationId: orgId, eventType },
    });
  }
}

export async function listOrders(orgId: string): Promise<OrderSummary[]> {
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
}

export async function getOrderDetail(orgId: string, orderId: string) {
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
}

export async function checkFreePlanLimit(orgId: string, currentPlan: string, maxOrders: number): Promise<boolean> {
  if (currentPlan !== "free") return false;

  const monthlyCount = await prisma.order.count({
    where: {
      organizationId: orgId,
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });

  return monthlyCount >= Math.min(maxOrders, FREE_TIER_LIMIT);
}

export async function createOrder(orgId: string, data: {
  buyerName: string;
  buyerPhone: string;
  product?: string;
  amount: number;
  buyerWilaya?: string;
}) {
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

  await emitCritical("ORDER_CREATED", { orderId: order.id, orgId });

  emit("ORDER_CREATED", {
    orderId: order.id,
    orgId,
    buyerName: data.buyerName,
    buyerPhone: data.buyerPhone,
    amount: Number(data.amount),
    product: data.product ?? null,
  });

  await ensureActivationEvent(orgId, "FIRST_ORDER_CREATED");

  return order;
}

export async function transitionOrderStatus(orgId: string, orderId: string, newStatus: OrderStatus) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
    });
    if (!order) return null;

    const previousStatus = order.status;

    if (!canTransition(previousStatus as never, newStatus as never)) {
      return null;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    emit("ORDER_UPDATED", {
      orderId,
      orgId,
      previousStatus,
      newStatus,
      buyerName: order.buyerName,
    });

    if (newStatus === "DELIVERED") {
      await scheduleD3UgcAsk(orderId);
    }

    if (newStatus === "REFUSED") {
      await alertSeller(orgId, refusedAlert(order.buyerName));
    }

    return { id: orderId, status: newStatus };
  } catch {
    return null;
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

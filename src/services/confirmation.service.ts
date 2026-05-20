import { prisma } from "@/lib/db";
import { addEvent } from "@/services/operation-timeline.service";
import { transitionOrderStatus } from "./order.service";
import { calculateActionOutcome } from "@/services/revenue-protection.service";
import { recordOutcome } from "@/services/operation-outcome.service";
import { getProviderRtsCost } from "@/services/delivery-provider.service";
import { recordAction } from "@/services/attribution.service";
import { recordJourneyEvent } from "@/services/buyer-journey.service";
import { JOURNEY_EVENT_TYPES } from "@/types/journey";
import type { OrderStatus } from "@/types/order";

export type ConfirmStatus = "pending_confirmation" | "contacted" | "confirmed" | "unreachable" | "suspicious" | "cancelled"

export interface ConfirmationQueueItem {
  orderId: string
  buyerName: string
  buyerPhone: string
  amount: number
  product: string | null
  riskLevel: string
  trustScore: number
  orderStatus: string
  confirmStatus: ConfirmStatus
  lastAttemptAt: string | null
  lastAttemptOutcome: string | null
  createdAt: string
}

export interface ConfirmationAttemptItem {
  id: string
  method: string
  outcome: string
  notes: string | null
  attemptedBy: string | null
  createdAt: string
}

export interface ConfirmationDetail {
  order: ConfirmationQueueItem
  attempts: ConfirmationAttemptItem[]
  riskExplanation: {
    signals: string[]
    recommendation: string
  }
}

export interface ConfirmationQueue {
  items: ConfirmationQueueItem[]
  total: number
  pendingCount: number
  contactedCount: number
}

export async function getConfirmationQueue(orgId: string): Promise<ConfirmationQueue> {
  try {
  const orders = await prisma.order.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: { notIn: ["DELIVERED", "REFUSED", "INTELLIGENT_CANCEL", "UGC_REQUESTED", "UGC_RECEIVED"] },
      OR: [
        { confirmStatus: "pending_confirmation" },
        { confirmStatus: "contacted" },
        { status: "CREATED", riskLevel: "high" },
        { status: "CREATED", riskLevel: "medium" },
      ],
    },
    orderBy: [
      { riskLevel: "desc" },
      { trustScore: "asc" },
      { createdAt: "asc" },
    ],
    take: 50,
    include: {
      confirmationAttempts: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  const items: ConfirmationQueueItem[] = orders.map((o) => {
    const last = o.confirmationAttempts[0]
    return {
      orderId: o.id,
      buyerName: o.buyerName,
      buyerPhone: o.buyerPhone,
      amount: Number(o.amount),
      product: o.product,
      riskLevel: o.riskLevel,
      trustScore: o.trustScore,
      orderStatus: o.status,
      confirmStatus: o.confirmStatus as ConfirmStatus,
      lastAttemptAt: last ? last.createdAt.toISOString() : null,
      lastAttemptOutcome: last ? last.outcome : null,
      createdAt: o.createdAt.toISOString(),
    }
  })

  return {
    items,
    total: items.length,
    pendingCount: items.filter((i) => i.confirmStatus === "pending_confirmation").length,
    contactedCount: items.filter((i) => i.confirmStatus === "contacted").length,
  }
  } catch {
    return { items: [], total: 0, pendingCount: 0, contactedCount: 0 };
  }
}

export async function getConfirmationDetail(orgId: string, orderId: string): Promise<ConfirmationDetail | null> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
      include: {
        confirmationAttempts: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    })

    if (!order) return null

    const signals = buildRiskSignals(order.riskLevel, order.trustScore, order.status)
    const recommendation = buildRecommendation(order.confirmStatus as ConfirmStatus, order.riskLevel)

    return {
      order: {
        orderId: order.id,
        buyerName: order.buyerName,
        buyerPhone: order.buyerPhone,
        amount: Number(order.amount),
        product: order.product,
        riskLevel: order.riskLevel,
        trustScore: order.trustScore,
        orderStatus: order.status,
        confirmStatus: order.confirmStatus as ConfirmStatus,
      lastAttemptAt: order.confirmationAttempts[0]?.createdAt.toISOString() ?? null,
      lastAttemptOutcome: order.confirmationAttempts[0]?.outcome ?? null,
      createdAt: order.createdAt.toISOString(),
    },
    attempts: order.confirmationAttempts.map((a) => ({
      id: a.id,
      method: a.method,
      outcome: a.outcome,
      notes: a.notes,
      attemptedBy: a.attemptedBy,
      createdAt: a.createdAt.toISOString(),
    })),
    riskExplanation: {
      signals,
      recommendation,
    },
  }
  } catch {
    return null;
  }
}

export async function markConfirmed(
  orgId: string,
  orderId: string,
  operator: string,
  method: string = "manual_call",
  notes?: string,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
    })
    if (!order) return { success: false }

    const rtsCost = await getProviderRtsCost(orgId, order.deliveryProviderId ?? undefined)
    const outcome = calculateActionOutcome(
      "confirm",
      Number(order.amount),
      order.riskLevel,
      order.trustScore,
      rtsCost
    )

    await prisma.order.update({
      where: { id: orderId },
      data: { confirmStatus: "confirmed" },
    })

    await logAttempt(orgId, orderId, method, "confirmed", notes, operator)

    const outcomeRecord = await recordOutcome(orgId, orderId, "confirm", {
      revenueSaved: outcome.revenueSaved,
      lossPrevented: outcome.lossPrevented,
      riskLevelBefore: order.riskLevel,
      orderAmount: Number(order.amount),
      trustScoreBefore: order.trustScore,
      attemptedBy: operator,
      notes,
    })

    if (outcomeRecord.success && outcomeRecord.id) {
      await recordAction(orgId, orderId, outcomeRecord.id, "confirm", outcome.revenueSaved)
    }

    await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.BUYER_CONFIRMED, {
      method,
      operator,
    })

    await addEvent(orgId, orderId, "operator.confirmed", "operator", {
      method,
      orderAmount: Number(order.amount),
    })

    if (order.status === "CREATED") {
      await transitionOrderStatus(orgId, orderId, "BUYER_CONFIRMED" as OrderStatus)
    }

    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function markUnreachable(
  orgId: string,
  orderId: string,
  method: string = "manual_call",
  notes?: string,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
    })
    if (!order) return { success: false }

    const rtsCost = await getProviderRtsCost(orgId, order.deliveryProviderId ?? undefined)
    const outcome = calculateActionOutcome(
      "unreachable",
      Number(order.amount),
      order.riskLevel,
      order.trustScore,
      rtsCost
    )

    await prisma.order.update({
      where: { id: orderId },
      data: { confirmStatus: "unreachable" },
    })

    await logAttempt(orgId, orderId, method, "unreachable", notes, undefined)

    const outcomeRecord = await recordOutcome(orgId, orderId, "unreachable", {
      revenueSaved: outcome.revenueSaved,
      lossPrevented: outcome.lossPrevented,
      riskLevelBefore: order.riskLevel,
      orderAmount: Number(order.amount),
      trustScoreBefore: order.trustScore,
      notes,
    })

    if (outcomeRecord.success && outcomeRecord.id) {
      await recordAction(orgId, orderId, outcomeRecord.id, "unreachable", outcome.revenueSaved)

      await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.BUYER_STOPPED_RESPONDING, {
        method,
      })
    }

    await addEvent(orgId, orderId, "operator.marked_unreachable", "operator", {
      method,
      orderAmount: Number(order.amount),
    })

    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function markSuspicious(
  orgId: string,
  orderId: string,
  notes?: string,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
    })
    if (!order) return { success: false }

    const rtsCost = await getProviderRtsCost(orgId, order.deliveryProviderId ?? undefined)
    const outcome = calculateActionOutcome(
      "suspicious",
      Number(order.amount),
      order.riskLevel,
      order.trustScore,
      rtsCost
    )

    await prisma.order.update({
      where: { id: orderId },
      data: { confirmStatus: "suspicious" },
    })

    await logAttempt(orgId, orderId, "manual_call", "suspicious", notes, undefined)

    const outcomeRecord = await recordOutcome(orgId, orderId, "suspicious", {
      revenueSaved: outcome.revenueSaved,
      lossPrevented: outcome.lossPrevented,
      riskLevelBefore: order.riskLevel,
      orderAmount: Number(order.amount),
      trustScoreBefore: order.trustScore,
      notes,
    })

    if (outcomeRecord.success && outcomeRecord.id) {
      await recordAction(orgId, orderId, outcomeRecord.id, "suspicious", outcome.revenueSaved)

      await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.BUYER_EXPRESSED_HESITATION, {
        notes: notes ?? null,
      })
    }

    await addEvent(orgId, orderId, "operator.verified_customer", "operator", {
      verified: false,
      trustDelta: -20,
    })

    await addEvent(orgId, orderId, "operator.added_note", "operator", {
      note: notes ?? "Marked suspicious",
      orderAmount: Number(order.amount),
    })

    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function scheduleRetry(
  orgId: string,
  orderId: string,
  notes?: string,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
    })
    if (!order) return { success: false }

    const rtsCost = await getProviderRtsCost(orgId, order.deliveryProviderId ?? undefined)
    const outcome = calculateActionOutcome(
      "retry",
      Number(order.amount),
      order.riskLevel,
      order.trustScore,
      rtsCost
    )

    await prisma.order.update({
      where: { id: orderId },
      data: { confirmStatus: "pending_confirmation" },
    })

    await logAttempt(orgId, orderId, "manual_call", "no_answer", notes, undefined)

    const outcomeRecord = await recordOutcome(orgId, orderId, "retry", {
      revenueSaved: outcome.revenueSaved,
      lossPrevented: outcome.lossPrevented,
      riskLevelBefore: order.riskLevel,
      orderAmount: Number(order.amount),
      trustScoreBefore: order.trustScore,
      notes,
    })

    if (outcomeRecord.success && outcomeRecord.id) {
      await recordAction(orgId, orderId, outcomeRecord.id, "retry", outcome.revenueSaved)

      await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.BUYER_RETRY_SCHEDULED, {
        notes: notes ?? null,
      })
    }

    await addEvent(orgId, orderId, "operator.scheduled_retry", "operator", {
      notes: notes ?? null,
      orderAmount: Number(order.amount),
    })

    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function cancelOrder(
  orgId: string,
  orderId: string,
  reason: string,
  operator: string,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
    })
    if (!order) return { success: false }

    const rtsCost = await getProviderRtsCost(orgId, order.deliveryProviderId ?? undefined)
    const outcome = calculateActionOutcome(
      "cancel",
      Number(order.amount),
      order.riskLevel,
      order.trustScore,
      rtsCost
    )

    await prisma.order.update({
      where: { id: orderId },
      data: { confirmStatus: "cancelled" },
    })

    await logAttempt(orgId, orderId, "manual_call", "cancelled", reason, operator)

    const outcomeRecord = await recordOutcome(orgId, orderId, "cancel", {
      revenueSaved: outcome.revenueSaved,
      lossPrevented: outcome.lossPrevented,
      riskLevelBefore: order.riskLevel,
      orderAmount: Number(order.amount),
      trustScoreBefore: order.trustScore,
      attemptedBy: operator,
      notes: reason,
    })

    if (outcomeRecord.success && outcomeRecord.id) {
      await recordAction(orgId, orderId, outcomeRecord.id, "cancel", outcome.revenueSaved)

      await recordJourneyEvent(orgId, orderId, JOURNEY_EVENT_TYPES.ORDER_CANCELLED, {
        reason,
        operator,
      })
    }

    await addEvent(orgId, orderId, "operator.cancelled", "operator", {
      reason,
      orderAmount: Number(order.amount),
    })

    await transitionOrderStatus(orgId, orderId, "INTELLIGENT_CANCEL" as OrderStatus)

    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function logAttempt(
  orgId: string,
  orderId: string,
  method: string,
  outcome: string,
  notes?: string,
  attemptedBy?: string,
): Promise<void> {
  try {
    await prisma.confirmationAttempt.create({
      data: {
        order: { connect: { id: orderId } },
        method,
        outcome,
        notes: notes ?? null,
        attemptedBy: attemptedBy ?? null,
      },
    })

    const eventType =
      outcome === "no_answer"
        ? JOURNEY_EVENT_TYPES.BUYER_NO_RESPONSE
        : outcome === "confirmed"
          ? JOURNEY_EVENT_TYPES.BUYER_RESPONDED
          : JOURNEY_EVENT_TYPES.BUYER_CONTACT_ATTEMPTED

    await recordJourneyEvent(orgId, orderId, eventType, {
      method,
      outcome,
      attemptedBy: attemptedBy ?? null,
    })
  } catch (e) {
    console.error("[confirmation.service] logAttempt failed:", e);
  }
}

// ─── OUTCOME MARKING ────────────────────────────────────────────────

export interface PendingOutcomeOrder {
  orderId: string
  buyerName: string
  buyerPhone: string
  amount: number
  product: string | null
  orderStatus: string
}

export async function getPendingOutcomeOrders(orgId: string): Promise<PendingOutcomeOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        status: { in: ["BUYER_CONFIRMED", "SHIPPED"] },
      },
      orderBy: { createdAt: "asc" },
      take: 20,
    })

    return orders.map((o) => ({
      orderId: o.id,
      buyerName: o.buyerName,
      buyerPhone: o.buyerPhone,
      amount: Number(o.amount),
      product: o.product,
      orderStatus: o.status,
    }))
  } catch {
    return []
  }
}

function buildRiskSignals(riskLevel: string, trustScore: number, status: string): string[] {
  const signals: string[] = []
  if (riskLevel === "high") signals.push(trustScore < 40 ? "First-time buyer" : "High risk score")
  if (riskLevel === "high" && trustScore < 30) signals.push("Multiple risk signals detected")
  if (status === "PENDING_RESCHEDULE") signals.push("Buyer requested reschedule")
  if (status === "PRE_SHIPPING_CONFIRM_SENT") signals.push("Confirmation sent — no reply")
  if (signals.length === 0) signals.push("Standard risk profile")
  return signals
}

function buildRecommendation(confirmStatus: ConfirmStatus, riskLevel: string): string {
  if (confirmStatus === "pending_confirmation" && riskLevel === "high") {
    return "Contact buyer immediately before shipping. Verify identity and order details."
  }
  if (confirmStatus === "contacted") {
    return "Follow up with buyer. If no response within 24h, consider marking unreachable."
  }
  if (confirmStatus === "unreachable") {
    return "All contact methods exhausted. Review order risk and consider cancellation."
  }
  if (confirmStatus === "suspicious") {
    return "Flagged for review. Do not ship until risk is resolved."
  }
  return "Standard confirmation — contact buyer to verify order."
}

// ──────────────────────────────────────────
// Merged from protect.service.ts
// ──────────────────────────────────────────

const CONFIRM_MESSAGE = "Commande mte3ek wajda 😍\nMazelt habb tconfirmi?";
const CONFIRM_BUTTONS = [
  { id: "confirm", title: "✅ Ayi Confirmi" },
  { id: "cancel", title: "❌ Batel" },
  { id: "reschedule", title: "🔄 Wa9t akher" },
];

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
    console.error("[confirmation.service] ensureActivationEvent failed:", e);
  }
}

export async function sendVerification(orgId: string, orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
    });
    if (!order) return { success: false };

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PRE_SHIPPING_CONFIRM_SENT" },
    });

    await addEvent(orgId, order.id, "comm.message_sent", "system", {
      to: order.buyerPhone,
      type: "interactive",
      template: "confirm",
      message: CONFIRM_MESSAGE,
    });

    await ensureActivationEvent(orgId, "FIRST_VERIFICATION_SENT");

    return { success: true };
  } catch (e) {
    console.error("[confirmation.service] sendVerification failed:", e);
    return { success: false };
  }
}

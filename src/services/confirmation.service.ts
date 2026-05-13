import { prisma } from "@/lib/db";
import { emit } from "@/lib/events/event-bus";
import { transitionOrderStatus } from "./order.service";
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
  const orders = await prisma.order.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
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
}

export async function getConfirmationDetail(orgId: string, orderId: string): Promise<ConfirmationDetail | null> {
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
}

export async function markConfirmed(
  orgId: string,
  orderId: string,
  operator: string,
  method: string = "manual_call",
  notes?: string,
): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
  })
  if (!order) throw new Error("Order not found")

  await prisma.order.update({
    where: { id: orderId },
    data: { confirmStatus: "confirmed" },
  })

  await logAttempt(orgId, orderId, method, "confirmed", notes, operator)

  emit("ORDER_CONFIRMED", {
    orderId,
    orgId,
    buyerName: order.buyerName,
    buyerPhone: order.buyerPhone,
    amount: Number(order.amount),
    confirmedBy: operator,
    method,
  })

  emit("CUSTOMER_VERIFIED", {
    orderId,
    orgId,
    buyerName: order.buyerName,
    buyerPhone: order.buyerPhone,
    verified: true,
    trustDelta: 15,
  })

  if (order.status === "CREATED") {
    try {
      await transitionOrderStatus(orgId, orderId, "BUYER_CONFIRMED" as OrderStatus)
    } catch {
      // state machine may not allow transition; confirmStatus is already set
    }
  }
}

export async function markUnreachable(
  orgId: string,
  orderId: string,
  method: string = "manual_call",
  notes?: string,
): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
  })
  if (!order) throw new Error("Order not found")

  await prisma.order.update({
    where: { id: orderId },
    data: { confirmStatus: "unreachable" },
  })

  await logAttempt(orgId, orderId, method, "unreachable", notes, undefined)

  emit("ORDER_UNREACHABLE", {
    orderId,
    orgId,
    buyerName: order.buyerName,
    buyerPhone: order.buyerPhone,
    attemptMethod: method,
  })
}

export async function markSuspicious(
  orgId: string,
  orderId: string,
  notes?: string,
): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
  })
  if (!order) throw new Error("Order not found")

  await prisma.order.update({
    where: { id: orderId },
    data: { confirmStatus: "suspicious" },
  })

  await logAttempt(orgId, orderId, "manual_call", "suspicious", notes, undefined)

  emit("CUSTOMER_VERIFIED", {
    orderId,
    orgId,
    buyerName: order.buyerName,
    buyerPhone: order.buyerPhone,
    verified: false,
    trustDelta: -20,
  })
}

export async function scheduleRetry(
  orgId: string,
  orderId: string,
  notes?: string,
): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
  })
  if (!order) throw new Error("Order not found")

  await prisma.order.update({
    where: { id: orderId },
    data: { confirmStatus: "pending_confirmation" },
  })

  await logAttempt(orgId, orderId, "manual_call", "no_answer", notes, undefined)
}

export async function cancelOrder(
  orgId: string,
  orderId: string,
  reason: string,
  operator: string,
): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
  })
  if (!order) throw new Error("Order not found")

  await prisma.order.update({
    where: { id: orderId },
    data: { confirmStatus: "cancelled" },
  })

  await logAttempt(orgId, orderId, "manual_call", "cancelled", reason, operator)

  emit("ORDER_CANCELLED", {
    orderId,
    orgId,
    buyerName: order.buyerName,
    buyerPhone: order.buyerPhone,
    reason,
    cancelledBy: operator,
  })

  try {
    await transitionOrderStatus(orgId, orderId, "INTELLIGENT_CANCEL" as OrderStatus)
  } catch {
    // state machine may reject; confirmStatus is already set
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
  await prisma.confirmationAttempt.create({
    data: {
      order: { connect: { id: orderId } },
      method,
      outcome,
      notes: notes ?? null,
      attemptedBy: attemptedBy ?? null,
    },
  })
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

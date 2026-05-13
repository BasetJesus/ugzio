import { prisma } from "@/lib/db";
import { getOverviewData } from "./overview.service";
import { getAggregateRiskStats, getNeedsConfirmCount } from "./risk.service";
import { getConfirmationQueue } from "./confirmation.service";
import { computeSystemState } from "./system-state.service";
import type { SystemState } from "./system-state.service";
import type { OverviewData } from "./overview.service";

export interface CriticalAction {
  id: string
  type: "verify" | "contact" | "review" | "flag" | "collect_ugc"
  priority: "critical" | "high" | "medium"
  orderId: string
  buyerName: string
  amount: number
  reason: string
  actionLabel: string
  actionHref: string
}

export interface RevenueAtRisk {
  totalAtRisk: number
  estimatedLoss: number
  highRiskOrderCount: number
}

export interface OrderNeedingAttention {
  orderId: string
  buyerName: string
  buyerPhone: string
  amount: number
  product: string | null
  status: string
  riskLevel: string
  trustScore: number
  reason: string
}

export interface TodayOperations {
  criticalActions: CriticalAction[]
  revenueAtRisk: RevenueAtRisk
  ordersNeedingAttention: OrderNeedingAttention[]
  systemState: SystemState
  overview: OverviewData
  summary: {
    totalOrdersToday: number
    revenueToday: number
    pendingVerifications: number
    ugcOpportunities: number
  }
}

export async function getTodayOperations(orgId: string): Promise<TodayOperations> {
  const [overview, riskStats, systemState, criticalActions, ordersNeedingAttention] = await Promise.all([
    getOverviewData(orgId),
    getAggregateRiskStats(orgId),
    computeSystemState(orgId),
    getCriticalActions(orgId),
    getOrdersNeedingAttention(orgId),
  ])

  return {
    criticalActions,
    revenueAtRisk: {
      totalAtRisk: riskStats.revenueAtRisk,
      estimatedLoss: Math.round(riskStats.revenueAtRisk * 0.3),
      highRiskOrderCount: riskStats.highRiskCount,
    },
    ordersNeedingAttention,
    systemState,
    overview,
    summary: {
      totalOrdersToday: overview.stats.ordersToday,
      revenueToday: overview.stats.revenueToday,
      pendingVerifications: overview.stats.pendingVerifications,
      ugcOpportunities: overview.stats.ugcReceived,
    },
  }
}

export async function getCriticalActions(orgId: string): Promise<CriticalAction[]> {
  const actions: CriticalAction[] = []

  const [queue, needsConfirm, ugcExpired] = await Promise.all([
    getConfirmationQueue(orgId),
    getNeedsConfirmCount(orgId),
    getExpiredUgcOrders(orgId),
  ])

  const pendingHighRisk = queue.items.filter(
    (i) => i.confirmStatus === "pending_confirmation" && i.riskLevel === "high",
  )

  for (const item of pendingHighRisk.slice(0, 5)) {
    actions.push({
      id: `verify_${item.orderId}`,
      type: "verify",
      priority: "critical",
      orderId: item.orderId,
      buyerName: item.buyerName,
      amount: item.amount,
      reason: "High-risk order — verify before shipping",
      actionLabel: "Verify now",
      actionHref: `/confirm?order=${item.orderId}`,
    })
  }

  const staleItems = queue.items.filter(
    (i) => i.confirmStatus === "contacted" || i.lastAttemptAt,
  )

  for (const item of staleItems.slice(0, 3)) {
    actions.push({
      id: `contact_${item.orderId}`,
      type: "contact",
      priority: needsConfirm > 3 ? "critical" : "high",
      orderId: item.orderId,
      buyerName: item.buyerName,
      amount: item.amount,
      reason: `Contacted — no confirmation yet`,
      actionLabel: "Review",
      actionHref: `/confirm?order=${item.orderId}`,
    })
  }

  for (const order of ugcExpired) {
    actions.push({
      id: `ugc_${order.id}`,
      type: "collect_ugc",
      priority: "medium",
      orderId: order.id,
      buyerName: order.buyerName,
      amount: Number(order.amount),
      reason: "Delivered 7+ days ago — ask for UGC",
      actionLabel: "Request UGC",
      actionHref: `/inbox?order=${order.id}`,
    })
  }

  return actions
}

export async function getRevenueAtRiskToday(orgId: string): Promise<RevenueAtRisk> {
  const dayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  const [highRiskTotal, highRiskToday] = await Promise.all([
    prisma.order.aggregate({
      where: { organizationId: orgId, deletedAt: null, riskLevel: "high" },
      _sum: { amount: true },
    }),
    prisma.order.count({
      where: { organizationId: orgId, deletedAt: null, riskLevel: "high", createdAt: { gte: dayStart } },
    }),
  ])

  const totalAtRisk = Math.round(Number(highRiskTotal._sum.amount ?? 0))
  return {
    totalAtRisk,
    estimatedLoss: Math.round(totalAtRisk * 0.3),
    highRiskOrderCount: highRiskToday,
  }
}

export async function getOrdersNeedingAttention(orgId: string): Promise<OrderNeedingAttention[]> {
  const orders = await prisma.order.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      confirmStatus: { notIn: ["confirmed", "cancelled"] },
      OR: [
        { status: "CREATED", riskLevel: "high" },
        { status: "PRE_SHIPPING_CONFIRM_SENT" },
        { status: "PENDING_RESCHEDULE" },
        { status: "REFUSED" },
      ],
    },
    orderBy: [
      { riskLevel: "desc" },
      { trustScore: "asc" },
    ],
    take: 20,
  })

  return orders.map((o) => ({
    orderId: o.id,
    buyerName: o.buyerName,
    buyerPhone: o.buyerPhone,
    amount: Number(o.amount),
    product: o.product,
    status: o.status,
    riskLevel: o.riskLevel,
    trustScore: o.trustScore,
    reason: computeAttentionReason(o.status, o.riskLevel),
  }))
}

async function getStaleConfirmations(orgId: string) {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const orders = await prisma.order.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: "PRE_SHIPPING_CONFIRM_SENT",
      createdAt: { lt: threeDaysAgo },
    },
    orderBy: { createdAt: "asc" },
    take: 5,
  })

  return orders.map((o) => ({
    id: o.id,
    buyerName: o.buyerName,
    amount: o.amount,
    daysWaiting: Math.floor((Date.now() - o.createdAt.getTime()) / 86400000),
  }))
}

async function getExpiredUgcOrders(orgId: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const orders = await prisma.order.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: "DELIVERED",
      createdAt: { lt: sevenDaysAgo },
    },
    take: 5,
    orderBy: { createdAt: "asc" },
  })

  const ugcReceived = await prisma.ugcItem.findMany({
    where: {
      order: { organizationId: orgId },
      status: "received",
    },
    select: { orderId: true },
  })
  const ugcOrderIds = new Set(ugcReceived.map((u) => u.orderId))

  return orders
    .filter((o) => !ugcOrderIds.has(o.id))
    .map((o) => ({
      id: o.id,
      buyerName: o.buyerName,
      amount: o.amount,
    }))
}

function computeAttentionReason(status: string, riskLevel: string): string {
  if (status === "CREATED" && riskLevel === "high") return "High risk — verify before shipping"
  if (status === "PRE_SHIPPING_CONFIRM_SENT") return "Awaiting buyer confirmation"
  if (status === "PENDING_RESCHEDULE") return "Buyer requested reschedule"
  if (status === "REFUSED") return "Order refused — follow up"
  return "Requires review"
}

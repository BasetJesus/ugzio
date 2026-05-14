import { prisma } from "@/lib/db"

export interface CancellationAnalytics {
  totalOrders: number
  cancelledCount: number
  refusedCount: number
  deliveredCount: number
  confirmedCount: number
  cancellationRate: number
  refusalRate: number
  deliveryRate: number
  beforeAfter: {
    beforeConfirm: { cancelled: number; total: number; rate: number }
    afterConfirm: { cancelled: number; total: number; rate: number }
  }
}

export async function getCancellationAnalytics(orgId: string): Promise<CancellationAnalytics> {
  try {
    const [total, cancelled, refused, delivered, confirmed] = await Promise.all([
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "INTELLIGENT_CANCEL" } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "REFUSED" } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: { in: ["DELIVERED", "UGC_REQUESTED", "UGC_RECEIVED"] } } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "BUYER_CONFIRMED" } }),
    ])

    const beforeConfirm = await prisma.order.count({
      where: {
        organizationId: orgId,
        deletedAt: null,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        status: "INTELLIGENT_CANCEL",
        confirmStatus: { in: ["pending_confirmation", "contacted"] },
      },
    })

    const afterConfirm = await prisma.order.count({
      where: {
        organizationId: orgId,
        deletedAt: null,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        status: "INTELLIGENT_CANCEL",
        confirmStatus: "confirmed",
      },
    })

    const totalLast30 = await prisma.order.count({
      where: { organizationId: orgId, deletedAt: null, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    })

    const confirmedLast30 = await prisma.order.count({
      where: {
        organizationId: orgId,
        deletedAt: null,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        status: "BUYER_CONFIRMED",
      },
    })

    return {
      totalOrders: total,
      cancelledCount: cancelled,
      refusedCount: refused,
      deliveredCount: delivered,
      confirmedCount: confirmed,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      refusalRate: total > 0 ? Math.round((refused / total) * 100) : 0,
      deliveryRate: total > 0 ? Math.round((delivered / total) * 100) : 0,
      beforeAfter: {
        beforeConfirm: { cancelled: beforeConfirm, total: totalLast30, rate: totalLast30 > 0 ? Math.round((beforeConfirm / totalLast30) * 100) : 0 },
        afterConfirm: { cancelled: afterConfirm, total: confirmedLast30, rate: confirmedLast30 > 0 ? Math.round((afterConfirm / confirmedLast30) * 100) : 0 },
      },
    }
  } catch {
    return {
      totalOrders: 0, cancelledCount: 0, refusedCount: 0, deliveredCount: 0,
      confirmedCount: 0, cancellationRate: 0, refusalRate: 0, deliveryRate: 0,
      beforeAfter: {
        beforeConfirm: { cancelled: 0, total: 0, rate: 0 },
        afterConfirm: { cancelled: 0, total: 0, rate: 0 },
      },
    }
  }
}

export interface BuyerSentimentSummary {
  totalFeedback: number
  averageSatisfaction: number
  distribution: Record<number, number>
}

export async function getBuyerSentiment(orgId: string): Promise<BuyerSentimentSummary> {
  try {
    const events = await prisma.operationEvent.findMany({
      where: {
        organizationId: orgId,
        type: "operator_note",
        actorType: "buyer",
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    const satisfactionScores: number[] = []
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    for (const e of events) {
      if (!e.metadata) continue
      try {
        const meta = JSON.parse(e.metadata)
        if (typeof meta.satisfaction === "number") {
          satisfactionScores.push(meta.satisfaction)
          distribution[meta.satisfaction] = (distribution[meta.satisfaction] ?? 0) + 1
        }
      } catch {
        // skip malformed metadata
      }
    }

    const total = satisfactionScores.length
    const avg = total > 0 ? Math.round((satisfactionScores.reduce((a, b) => a + b, 0) / total) * 10) / 10 : 0

    return { totalFeedback: total, averageSatisfaction: avg, distribution }
  } catch {
    return { totalFeedback: 0, averageSatisfaction: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  }
}

import { prisma } from "@/lib/db"
import { getCancellationAnalytics, type CancellationAnalytics } from "./cancellation-analytics.service"

export interface CaseStudyComparison {
  baseline: CancellationAnalytics | null
  current: CancellationAnalytics
  improvement: {
    cancellationRateDelta: number
    deliveryRateDelta: number
    cancellationReduced: boolean
    deliveryImproved: boolean
  }
}

export async function recordAnalyticsSnapshot(orgId: string, snapshotType: "baseline" | "monthly"): Promise<void> {
  try {
    const existing = snapshotType === "baseline"
      ? await prisma.operationEvent.findFirst({
          where: { organizationId: orgId, type: "analytics_snapshot", actorType: "system" },
        })
      : null

    if (existing) return

    const analytics = await getCancellationAnalytics(orgId)
    await prisma.operationEvent.create({
      data: {
        organizationId: orgId,
        orderId: "",
        type: "analytics_snapshot",
        metadata: JSON.stringify({ ...analytics, snapshotType }),
        actorType: "system",
      },
    })
  } catch {
    // silently fail — snapshot is non-critical
  }
}

export async function getCaseStudyComparison(orgId: string): Promise<CaseStudyComparison> {
  try {
    const current = await getCancellationAnalytics(orgId)

    const baselineEvent = await prisma.operationEvent.findFirst({
      where: { organizationId: orgId, type: "analytics_snapshot", actorType: "system" },
      orderBy: { createdAt: "asc" },
    })

    let baseline: CancellationAnalytics | null = null
    if (baselineEvent?.metadata) {
      try {
        const parsed = JSON.parse(baselineEvent.metadata)
        baseline = parsed as CancellationAnalytics
      } catch {
        // malformed metadata
      }
    }

    const cancellationRateDelta = baseline ? baseline.cancellationRate - current.cancellationRate : 0
    const deliveryRateDelta = baseline ? current.deliveryRate - baseline.deliveryRate : 0

    return {
      baseline,
      current,
      improvement: {
        cancellationRateDelta,
        deliveryRateDelta,
        cancellationReduced: cancellationRateDelta > 0,
        deliveryImproved: deliveryRateDelta > 0,
      },
    }
  } catch {
    const empty = {
      totalOrders: 0, cancelledCount: 0, refusedCount: 0, deliveredCount: 0,
      confirmedCount: 0, cancellationRate: 0, refusalRate: 0, deliveryRate: 0,
      beforeAfter: {
        beforeConfirm: { cancelled: 0, total: 0, rate: 0 },
        afterConfirm: { cancelled: 0, total: 0, rate: 0 },
      },
    }
    return {
      baseline: null,
      current: empty,
      improvement: { cancellationRateDelta: 0, deliveryRateDelta: 0, cancellationReduced: false, deliveryImproved: false },
    }
  }
}

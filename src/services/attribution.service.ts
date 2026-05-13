import { prisma } from "@/lib/db"

export interface ActionEffectivenessRow {
  actionTaken: string
  sequenceType: string | null
  sequenceVersion: number | null
  timesUsed: number
  deliveryRate: number
  avgRevenueSaved: number
  avgDaysToOutcome: number | null
  deliveredCount: number
  failedCount: number
  confidenceLevel: "high" | "medium" | "low"
}

export interface EffectivenessFilters {
  firstTimeBuyer?: boolean
  city?: string
  riskTier?: "low" | "medium" | "high"
  sequenceType?: string
  actionTaken?: string
  minSamples?: number
  days?: number
}

const MIN_SAMPLES_DEFAULT = 5
const CONFIDENCE_THRESHOLDS = { high: 30, medium: 10 }

function confidenceLevel(samples: number): "high" | "medium" | "low" {
  if (samples >= CONFIDENCE_THRESHOLDS.high) return "high"
  if (samples >= CONFIDENCE_THRESHOLDS.medium) return "medium"
  return "low"
}

function mapTimelineToSequence(eventType: string | null): {
  sequenceType: string | null
  sequenceVersion: number | null
} {
  switch (eventType) {
    case "ANTICIPATION":
    case "SOCIAL_PROOF":
      return { sequenceType: "trust", sequenceVersion: 1 }
    case "VISUAL_OWNERSHIP":
      return { sequenceType: "reassurance", sequenceVersion: 1 }
    case "PRE_DELIVERY_CONFIRM":
      return { sequenceType: "urgency", sequenceVersion: 1 }
    case "D3_UGC_ASK":
      return { sequenceType: "reminder", sequenceVersion: 1 }
    default:
      return { sequenceType: null, sequenceVersion: null }
  }
}

async function getOrderWithSnapshots(orgId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
    select: {
      trustScore: true,
      amount: true,
      buyerWilaya: true,
      confirmStatus: true,
      status: true,
      buyerPhone: true,
      timeline: {
        where: { status: "sent" },
        orderBy: { sentAt: "desc" },
        take: 1,
        select: { eventType: true },
      },
    },
  })
  if (!order) return { order: null, buyerOrderCount: 0 }

  const buyer = await prisma.buyerIdentity.findFirst({
    where: { anonymizedId: order.buyerPhone },
    select: { totalOrders: true },
  })

  return { order, buyerOrderCount: buyer?.totalOrders ?? 0 }
}

function buildSnapshotData(order: NonNullable<Awaited<ReturnType<typeof getOrderWithSnapshots>>["order"]>, buyerOrderCount: number) {
  return {
    riskScoreSnapshot: order.trustScore,
    orderValueSnapshot: Number(order.amount),
    buyerOrderCountSnapshot: buyerOrderCount,
    isFirstOrderSnapshot: buyerOrderCount <= 1,
    citySnapshot: order.buyerWilaya ?? null,
    paymentMethodSnapshot: "COD",
    confirmationStateSnapshot: order.confirmStatus,
  }
}

// ─── RECORD ACTION ───────────────────────────────────────────────

export async function recordAction(
  orgId: string,
  orderId: string,
  actionId: string,
  actionTaken: string,
  revenueSaved: number,
): Promise<{ success: boolean }> {
  try {
    const { order, buyerOrderCount } = await getOrderWithSnapshots(orgId, orderId)
    if (!order) return { success: false }

    const snapshots = buildSnapshotData(order, buyerOrderCount)

    const timelineEventType = order.timeline[0]?.eventType ?? null
    const { sequenceType, sequenceVersion } = mapTimelineToSequence(timelineEventType)

    await prisma.actionOutcomeAttribution.create({
      data: {
        organizationId: orgId,
        orderId,
        actionId,
        actionTaken,
        sequenceType,
        sequenceVersion,
        estimatedRevenueSaved: revenueSaved,
        ...snapshots,
      },
    })

    return { success: true }
  } catch {
    return { success: false }
  }
}

// ─── RESOLVE DELIVERY OUTCOME ─────────────────────────────────────

export async function resolveDeliveryOutcome(
  orgId: string,
  orderId: string,
  finalOutcome: string,
): Promise<{ success: boolean; baselineCreated?: boolean }> {
  try {
    let attribution = await prisma.actionOutcomeAttribution.findFirst({
      where: { orderId, finalDeliveryOutcome: null },
      orderBy: { createdAt: "desc" },
    })

    let baselineCreated = false

    if (!attribution) {
      const { order, buyerOrderCount } = await getOrderWithSnapshots(
        orgId,
        orderId,
      )
      if (!order) return { success: false }

      const snapshots = buildSnapshotData(order, buyerOrderCount)

      const baselineId = "baseline_" + orderId
      attribution = await prisma.actionOutcomeAttribution.create({
        data: {
          organizationId: orgId,
          orderId,
          actionId: baselineId,
          actionTaken: "NO_ACTION",
          estimatedRevenueSaved: 0,
          ...snapshots,
        },
      })
      baselineCreated = true
    }

    const daysToOutcome = Math.floor(
      (Date.now() - new Date(attribution.createdAt).getTime()) / 86400000,
    )

    await prisma.actionOutcomeAttribution.update({
      where: { id: attribution.id },
      data: {
        finalDeliveryOutcome: finalOutcome,
        daysToOutcome,
        resolvedAt: new Date(),
      },
    })

    return { success: true, baselineCreated }
  } catch {
    return { success: false }
  }
}

// ─── COHORT QUERY HELPERS ─────────────────────────────────────────

function buildCohortWhere(orgId: string, filters: EffectivenessFilters) {
  const where: Record<string, unknown> = {
    organizationId: orgId,
    finalDeliveryOutcome: { not: null },
  }

  if (filters.days && filters.days > 0) {
    const since = new Date()
    since.setDate(since.getDate() - filters.days)
    where.createdAt = { gte: since }
  }

  if (filters.actionTaken) {
    where.actionTaken = filters.actionTaken
  }

  if (filters.sequenceType) {
    where.sequenceType = filters.sequenceType
  }

  if (filters.firstTimeBuyer !== undefined) {
    where.isFirstOrderSnapshot = filters.firstTimeBuyer
  }

  if (filters.city) {
    where.citySnapshot = filters.city
  }

  if (filters.riskTier) {
    const tier = filters.riskTier as string
    if (tier === "high") {
      where.riskScoreSnapshot = { lte: 40 }
    } else if (tier === "medium") {
      where.riskScoreSnapshot = { gte: 41, lte: 70 }
    } else if (tier === "low") {
      where.riskScoreSnapshot = { gte: 71 }
    }
  }

  return where
}

// ─── GET EFFECTIVENESS ───────────────────────────────────────────

export async function getActionEffectiveness(
  orgId: string,
  filters: EffectivenessFilters = {},
): Promise<ActionEffectivenessRow[]> {
  try {
    const minSamples = filters.minSamples ?? MIN_SAMPLES_DEFAULT
    const where = buildCohortWhere(orgId, filters)

    const rows = await prisma.actionOutcomeAttribution.findMany({ where })

    const grouped = new Map<string, ActionEffectivenessRow>()

    for (const row of rows) {
      const key =
        row.actionTaken + "|" + (row.sequenceType ?? "manual") + "|" + (row.sequenceVersion ?? 0)
      const existing = grouped.get(key) ?? {
        actionTaken: row.actionTaken,
        sequenceType: row.sequenceType,
        sequenceVersion: row.sequenceVersion,
        timesUsed: 0,
        deliveryRate: 0,
        avgRevenueSaved: 0,
        avgDaysToOutcome: null,
        deliveredCount: 0,
        failedCount: 0,
        confidenceLevel: "low" as const,
      }

      existing.timesUsed++
      existing.avgRevenueSaved += row.estimatedRevenueSaved
      if (row.finalDeliveryOutcome === "DELIVERED") {
        existing.deliveredCount++
      } else {
        existing.failedCount++
      }
      if (row.daysToOutcome != null) {
        existing.avgDaysToOutcome = (existing.avgDaysToOutcome ?? 0) + row.daysToOutcome
      }

      grouped.set(key, existing)
    }

    const result = Array.from(grouped.values())
      .filter((g) => g.timesUsed >= minSamples)
      .map((g) => ({
        ...g,
        deliveryRate:
          g.timesUsed > 0
            ? Math.round((g.deliveredCount / (g.deliveredCount + g.failedCount)) * 100)
            : 0,
        avgRevenueSaved:
          g.timesUsed > 0 ? Math.round(g.avgRevenueSaved / g.timesUsed) : 0,
        avgDaysToOutcome:
          g.avgDaysToOutcome != null
            ? Math.round(g.avgDaysToOutcome / g.timesUsed)
            : null,
        confidenceLevel: confidenceLevel(g.timesUsed),
      }))
      .sort((a, b) => b.avgRevenueSaved - a.avgRevenueSaved)

    return result
  } catch {
    return []
  }
}

// ─── COHORT DATA HELPERS ─────────────────────────────────────────

export async function getAvailableCities(orgId: string): Promise<string[]> {
  try {
    const result = await prisma.actionOutcomeAttribution.findMany({
      where: {
        organizationId: orgId,
        citySnapshot: { not: null },
      },
      select: { citySnapshot: true },
      distinct: ["citySnapshot"],
    })
    return result
      .map((r) => r.citySnapshot)
      .filter((c): c is string => c !== null)
      .sort()
  } catch {
    return []
  }
}

export async function getCohortSummary(
  orgId: string,
  cohortLabel: string,
  filters: EffectivenessFilters = {},
): Promise<{
  label: string
  deliveryRate: number
  sampleCount: number
  avgRevenueSaved: number
  confidenceLevel: "high" | "medium" | "low"
}> {
  try {
    const rows = await getActionEffectiveness(orgId, { ...filters, minSamples: 1 })
    const total: ActionEffectivenessRow = rows.reduce(
      (acc, r) => ({
        ...acc,
        timesUsed: acc.timesUsed + r.timesUsed,
        deliveredCount: acc.deliveredCount + r.deliveredCount,
        failedCount: acc.failedCount + r.failedCount,
        avgRevenueSaved: acc.avgRevenueSaved + r.avgRevenueSaved * r.timesUsed,
      }),
      {
        actionTaken: "",
        sequenceType: null,
        sequenceVersion: null,
        timesUsed: 0,
        deliveryRate: 0,
        avgRevenueSaved: 0,
        avgDaysToOutcome: null,
        deliveredCount: 0,
        failedCount: 0,
        confidenceLevel: "low" as const,
      },
    )

    const deliveryRate =
      total.timesUsed > 0
        ? Math.round((total.deliveredCount / (total.deliveredCount + total.failedCount)) * 100)
        : 0

    return {
      label: cohortLabel,
      deliveryRate,
      sampleCount: total.timesUsed,
      avgRevenueSaved:
        total.timesUsed > 0 ? Math.round(total.avgRevenueSaved / total.timesUsed) : 0,
      confidenceLevel: confidenceLevel(total.timesUsed),
    }
  } catch {
    return {
      label: cohortLabel,
      deliveryRate: 0,
      sampleCount: 0,
      avgRevenueSaved: 0,
      confidenceLevel: "low",
    }
  }
}

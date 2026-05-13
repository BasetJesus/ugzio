import { prisma } from "@/lib/db"

export interface ActionEffectivenessRow {
  actionTaken: string
  sequenceType: string | null
  timesUsed: number
  deliveryRate: number
  avgRevenueSaved: number
  avgDaysToOutcome: number | null
  deliveredCount: number
  failedCount: number
}

export async function recordAction(
  orgId: string,
  orderId: string,
  actionId: string,
  actionTaken: string,
  revenueSaved: number,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
      select: {
        id: true,
        timeline: {
          where: { status: "sent" },
          orderBy: { sentAt: "desc" },
          take: 1,
          select: { eventType: true },
        },
      },
    })
    if (!order) return { success: false }

    const timelineEventType = order.timeline[0]?.eventType ?? null
    const sequenceType = mapTimelineToSequence(timelineEventType)

    await prisma.actionOutcomeAttribution.create({
      data: {
        organizationId: orgId,
        orderId,
        actionId,
        actionTaken,
        sequenceType,
        estimatedRevenueSaved: revenueSaved,
      },
    })

    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function resolveDeliveryOutcome(
  orderId: string,
  finalOutcome: string,
): Promise<{ success: boolean }> {
  try {
    const attribution = await prisma.actionOutcomeAttribution.findFirst({
      where: { orderId, finalDeliveryOutcome: null },
      orderBy: { createdAt: "desc" },
    })
    if (!attribution) return { success: false }

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

    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function getActionEffectiveness(
  orgId: string,
  days: number = 30,
): Promise<ActionEffectivenessRow[]> {
  try {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const rows = await prisma.actionOutcomeAttribution.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: since },
        finalDeliveryOutcome: { not: null },
      },
    })

    const grouped = new Map<string, ActionEffectivenessRow>()

    for (const row of rows) {
      const key = row.actionTaken + "|" + (row.sequenceType ?? "manual")
      const existing = grouped.get(key) ?? {
        actionTaken: row.actionTaken,
        sequenceType: row.sequenceType,
        timesUsed: 0,
        deliveryRate: 0,
        avgRevenueSaved: 0,
        avgDaysToOutcome: null,
        deliveredCount: 0,
        failedCount: 0,
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

    return Array.from(grouped.values())
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
      }))
      .sort((a, b) => b.avgRevenueSaved - a.avgRevenueSaved)
  } catch {
    return []
  }
}

function mapTimelineToSequence(eventType: string | null): string | null {
  switch (eventType) {
    case "anticipation":
      return "trust"
    case "social_proof":
      return "trust"
    case "visual_ownership":
      return "reassurance"
    case "pre_delivery_confirm":
      return "urgency"
    case "d3_ugc_ask":
      return "reminder"
    default:
      return null
  }
}

import { prisma } from "@/lib/db"
import { getActionEffectiveness } from "@/services/attribution.service"

export interface BehavioralInsight {
  title: string
  narrative: string
  emotion: "protective" | "achievement" | "calm" | "tense"
  confidence: "high" | "medium" | "low"
}

export interface SequenceEffectiveness {
  sequenceType: string
  label: string
  deliveryRate: number
  timesUsed: number
  avgRevenueSaved: number
  confidenceLevel: "high" | "medium" | "low"
}

export interface WeeklyStory {
  revenueProtected: number
  failedDeliveriesPrevented: number
  bestSequence: string
  bestSequenceRate: number
  operationalImprovement: number
  totalActions: number
}

const SEQUENCE_LABELS: Record<string, string> = {
  trust: "Trust",
  reassurance: "Reassurance",
  urgency: "Urgency",
  reminder: "Reminder",
}

export async function getSequenceEffectiveness(
  orgId: string,
): Promise<SequenceEffectiveness[]> {
  try {
    const rows = await getActionEffectiveness(orgId, { minSamples: 1 })
    return rows
      .filter((r) => r.sequenceType !== null && r.actionTaken !== "NO_ACTION")
      .map((r) => ({
        sequenceType: r.sequenceType!,
        label: SEQUENCE_LABELS[r.sequenceType!] ?? r.sequenceType!,
        deliveryRate: r.deliveryRate,
        timesUsed: r.timesUsed,
        avgRevenueSaved: r.avgRevenueSaved,
        confidenceLevel: r.confidenceLevel,
      }))
      .sort((a, b) => b.deliveryRate - a.deliveryRate)
  } catch {
    return []
  }
}

export async function getWeeklyStory(orgId: string): Promise<WeeklyStory> {
  try {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    weekStart.setHours(0, 0, 0, 0)

    const outcomes = await prisma.operationOutcome.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: weekStart },
      },
    })

    const revenueProtected = outcomes.reduce((s, o) => s + Number(o.estimatedRevenueSaved), 0)
    const lossPrevented = outcomes.reduce((s, o) => s + Number(o.estimatedLossPrevented), 0)
    const totalActions = outcomes.length

    const effectiveness = await getSequenceEffectiveness(orgId)
    const best = effectiveness[0]

    const prevWeekStart = new Date(weekStart)
    prevWeekStart.setDate(prevWeekStart.getDate() - 7)
    const prevOutcomes = await prisma.operationOutcome.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: prevWeekStart, lt: weekStart },
      },
    })
    const prevRevenue = prevOutcomes.reduce((s, o) => s + Number(o.estimatedRevenueSaved), 0)
    const operationalImprovement = prevRevenue > 0
      ? Math.round(((revenueProtected - prevRevenue) / prevRevenue) * 100)
      : 0

    return {
      revenueProtected,
      failedDeliveriesPrevented: Math.round(lossPrevented / 15),
      bestSequence: best?.label ?? "N/A",
      bestSequenceRate: best?.deliveryRate ?? 0,
      operationalImprovement,
      totalActions,
    }
  } catch {
    return {
      revenueProtected: 0,
      failedDeliveriesPrevented: 0,
      bestSequence: "N/A",
      bestSequenceRate: 0,
      operationalImprovement: 0,
      totalActions: 0,
    }
  }
}

export interface TrustMomentumData {
  trustImprovement: number
  confirmedOrders: number
  successfulDeliveries: number
  ugcRequestsTriggered: number
  bestSequence: string
  buyerSatisfactionScore: number
}

export async function getTrustMomentum(orgId: string): Promise<TrustMomentumData> {
  try {
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)
    thisWeek.setHours(0, 0, 0, 0)

    const prevWeek = new Date(thisWeek)
    prevWeek.setDate(prevWeek.getDate() - 7)

    const [totalOrders, confirmedOrders, successfulDeliveries, ugcCount, sequenceEffectiveness] = await Promise.all([
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.order.count({
        where: {
          organizationId: orgId,
          deletedAt: null,
          OR: [
            { confirmStatus: "confirmed" },
            { status: "BUYER_CONFIRMED" },
          ],
        },
      }),
      prisma.order.count({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: { in: ["DELIVERED", "UGC_REQUESTED", "UGC_RECEIVED"] },
        },
      }),
      prisma.ugcItem.count({ where: { order: { organizationId: orgId } } }),
      getSequenceEffectiveness(orgId),
    ])

    const prevWeekConfirmed = await prisma.order.count({
      where: {
        organizationId: orgId,
        deletedAt: null,
        confirmStatus: "confirmed",
        createdAt: { gte: prevWeek, lt: thisWeek },
      },
    })

    const thisWeekConfirmed = await prisma.order.count({
      where: {
        organizationId: orgId,
        deletedAt: null,
        confirmStatus: "confirmed",
        createdAt: { gte: thisWeek },
      },
    })

    const trustImprovement = prevWeekConfirmed > 0
      ? Math.round(((thisWeekConfirmed - prevWeekConfirmed) / prevWeekConfirmed) * 100)
      : 0

    const bestSequence = sequenceEffectiveness[0]?.label ?? "N/A"
    const deliveredRate = totalOrders > 0 ? Math.round((successfulDeliveries / totalOrders) * 100) : 0

    return {
      trustImprovement: Math.max(0, trustImprovement),
      confirmedOrders,
      successfulDeliveries,
      ugcRequestsTriggered: ugcCount,
      bestSequence,
      buyerSatisfactionScore: deliveredRate,
    }
  } catch {
    return {
      trustImprovement: 0,
      confirmedOrders: 0,
      successfulDeliveries: 0,
      ugcRequestsTriggered: 0,
      bestSequence: "N/A",
      buyerSatisfactionScore: 0,
    }
  }
}

export async function getBehavioralInsights(orgId: string): Promise<BehavioralInsight[]> {
  try {
    const effectiveness = await getSequenceEffectiveness(orgId)
    const insights: BehavioralInsight[] = []

    const reassurance = effectiveness.find((e) => e.sequenceType === "reassurance")
    if (reassurance && reassurance.deliveryRate >= 70 && reassurance.timesUsed >= 3) {
      insights.push({
        title: "Reassurance performs best for first-time buyers",
        narrative: `${reassurance.label} sequence has ${reassurance.deliveryRate}% delivery rate across ${reassurance.timesUsed} uses. Continue using for high-trust interactions.`,
        emotion: "protective",
        confidence: reassurance.confidenceLevel,
      })
    }

    const reminder = effectiveness.find((e) => e.sequenceType === "reminder")
    if (reminder && reminder.deliveryRate >= 60 && reminder.timesUsed >= 3) {
      insights.push({
        title: "Reminder reduces missed calls",
        narrative: `${reminder.label} sequence achieves ${reminder.deliveryRate}% delivery rate. Effective for re-engaging unresponsive buyers.`,
        emotion: "achievement",
        confidence: reminder.confidenceLevel,
      })
    }

    const urgency = effectiveness.find((e) => e.sequenceType === "urgency")
    if (urgency && urgency.deliveryRate < 50 && urgency.timesUsed >= 3) {
      insights.push({
        title: "Urgency underperforms on current orders",
        narrative: `${urgency.label} sequence shows ${urgency.deliveryRate}% delivery rate. Consider reassurance or trust sequences for better outcomes.`,
        emotion: "tense",
        confidence: urgency.confidenceLevel,
      })
    }

    const trust = effectiveness.find((e) => e.sequenceType === "trust")
    if (trust && trust.deliveryRate >= 75 && trust.timesUsed >= 5) {
      insights.push({
        title: "Trust sequence is your most reliable",
        narrative: `${trust.label} sequence delivers ${trust.deliveryRate}% success rate across ${trust.timesUsed} orders. Consistent performer.`,
        emotion: "calm",
        confidence: trust.confidenceLevel,
      })
    }

    if (insights.length === 0) {
      insights.push({
        title: "Gathering behavioral data",
        narrative: "Continue processing orders to generate sequence effectiveness insights. More data needed for reliable patterns.",
        emotion: "calm",
        confidence: "low",
      })
    }

    return insights
  } catch {
    return [{
      title: "Behavioral insights unavailable",
      narrative: "Unable to analyze sequence effectiveness at this time.",
      emotion: "calm",
      confidence: "low",
    }]
  }
}

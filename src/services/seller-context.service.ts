import { prisma } from "@/lib/db"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DailyMomentum {
  protectedToday: number
  confirmations: number
  buyersReplied: number
  ugcRequests: number
  streak: number
  streakLabel: string
}

export type SellerStyle = "stable_operator" | "fast_responder" | "high_risk_defender" | "momentum_builder" | "relationship_seller"

export interface SellerBusinessProfile {
  businessRhythm: string
  averageOrderValue: number
  operationalIntensity: "high" | "moderate" | "steady"
  confirmationBehavior: string
  buyerResponsiveness: number
  trustMomentum: number
}

export interface BusinessRhythm {
  busiestHour: number
  peakPeriodLabel: string
  secondPeakPeriodLabel: string | null
  confirmationSpeedTrend: "improving" | "stable" | "declining"
  buyerResponsivenessTrend: "improving" | "stable" | "declining"
  highRiskPeriods: string[]
  strongestSequence: string
  repeatBuyerStability: number
}

export interface SellerStyleData {
  style: SellerStyle
  label: string
  description: string
  accent: string
}

export interface ContinuityMessage {
  text: string
  positive: boolean
}

export interface SellerContext {
  profile: SellerBusinessProfile
  rhythm: BusinessRhythm
  style: SellerStyleData
  continuity: ContinuityMessage[]
  narrative: string
}

const STYLE_DEFS: Record<SellerStyle, { label: string; description: string; accent: string }> = {
  stable_operator: {
    label: "Stable Operator",
    description: "Consistent, reliable operational rhythm",
    accent: "var(--state-stable)",
  },
  fast_responder: {
    label: "Fast Responder",
    description: "Quick confirmations keep revenue flowing",
    accent: "var(--state-protected)",
  },
  high_risk_defender: {
    label: "High-Risk Defender",
    description: "Protecting revenue from risky orders",
    accent: "var(--state-urgent)",
  },
  momentum_builder: {
    label: "Momentum Builder",
    description: "Your operation is gaining traction",
    accent: "var(--state-calm)",
  },
  relationship_seller: {
    label: "Relationship Seller",
    description: "Strong buyer relationships drive your business",
    accent: "var(--psych-reassurance)",
  },
}

const SEQUENCE_LABELS: Record<string, string> = {
  trust: "Trust",
  reassurance: "Reassurance",
  urgency: "Urgency",
  reminder: "Reminder",
}

// ─── Private helpers ────────────────────────────────────────────────────────

function hourLabel(h: number): string {
  if (h < 5) return "Late night"
  if (h < 9) return "Early morning"
  if (h < 12) return "Morning"
  if (h < 14) return "Midday"
  if (h < 17) return "Afternoon"
  if (h < 20) return "Evening"
  return "Night"
}

function hourPeriod(h: number): string {
  if (h < 5) return "Late night"
  if (h < 9) return `Early morning (${h}-${h + 1}h)`
  if (h < 12) return `Morning (${h}-${h + 1}h)`
  if (h < 14) return `Midday (${h}-${h + 1}h)`
  if (h < 17) return `Afternoon (${h}-${h + 1}h)`
  if (h < 20) return `Evening (${h}-${h + 1}h)`
  return `Night (${h}-${h + 1}h)`
}

function detectStyle(
  avgOrderValue: number,
  riskLevelCounts: { high: number; medium: number; low: number },
  totalOrders: number,
  confirmedRate: number,
  buyerResponsiveness: number,
  repeatRatio: number,
  strongestSequence: string
): SellerStyle {
  const highRiskRatio = totalOrders > 0 ? riskLevelCounts.high / totalOrders : 0
  const volume = totalOrders

  if (highRiskRatio > 0.35 && confirmedRate > 50) return "high_risk_defender"
  if (repeatRatio > 0.3 && strongestSequence === "reassurance") return "relationship_seller"
  if (confirmedRate > 75 && buyerResponsiveness > 60) return "fast_responder"
  if (volume > 30 && confirmedRate > 60) return "momentum_builder"
  return "stable_operator"
}

// ─── Daily Momentum ─────────────────────────────────────────────────────────

export async function getDailyMomentum(orgId: string): Promise<DailyMomentum> {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const yesterday = new Date(todayStart); yesterday.setDate(yesterday.getDate() - 1)

    const [todayOutcomes, todayEvents, yesterdayEvents] = await Promise.all([
      prisma.operationOutcome.findMany({
        where: { organizationId: orgId, createdAt: { gte: todayStart } },
      }),
      prisma.operationEvent.findMany({
        where: { organizationId: orgId, createdAt: { gte: todayStart }, type: "buyer_replied" },
      }),
      prisma.operationEvent.findMany({
        where: { organizationId: orgId, createdAt: { gte: yesterday, lt: todayStart }, type: "buyer_replied" },
      }),
    ])

    const ugcCount = await prisma.ugcItem.count({
      where: { order: { organizationId: orgId }, createdAt: { gte: todayStart } },
    })

    const protectedToday = todayOutcomes.reduce((s, o) => s + Number(o.estimatedRevenueSaved), 0)
    const confirmations = todayOutcomes.filter((o) => o.actionTaken === "confirm").length
    const buyersReplied = todayEvents.length

    // Streak: count consecutive days backwards with at least 1 outcome or reply event
    let streak = 0
    if (todayOutcomes.length > 0 || buyersReplied > 0) streak = 1
    if (streak > 0 && yesterdayEvents.length > 0) {
      streak = 2
      for (let d = 2; d < 30; d++) {
        const dayStart = new Date(todayStart); dayStart.setDate(dayStart.getDate() - d)
        const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1)
        const prevEvents = await prisma.operationEvent.count({
          where: { organizationId: orgId, createdAt: { gte: dayStart, lt: dayEnd }, type: { in: ["buyer_replied", "confirmed"] } },
        })
        const prevOutcomes = await prisma.operationOutcome.count({
          where: { organizationId: orgId, createdAt: { gte: dayStart, lt: dayEnd } },
        })
        if (prevEvents > 0 || prevOutcomes > 0) streak++
        else break
      }
    }

    let streakLabel: string
    if (streak === 0) streakLabel = "Start your operational streak"
    else if (streak === 1) streakLabel = "1 day protecting revenue"
    else if (streak < 4) streakLabel = `${streak} days protecting revenue`
    else if (streak < 7) streakLabel = `${streak} days — momentum building`
    else if (streak < 14) streakLabel = `${streak} days — strong operational rhythm`
    else streakLabel = `${streak} days — elite operational consistency`

    return { protectedToday, confirmations, buyersReplied, ugcRequests: ugcCount, streak, streakLabel }
  } catch {
    return { protectedToday: 0, confirmations: 0, buyersReplied: 0, ugcRequests: 0, streak: 0, streakLabel: "Getting started" }
  }
}

// ─── Main service ───────────────────────────────────────────────────────────

export async function getSellerContext(orgId: string): Promise<SellerContext> {
  try {
    const now = new Date()
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)

    const [
      orders,
      outcomes,
      events,
      confirmationAttempts,
      attributions,
      orderCount,
      prevOutcomes,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { organizationId: orgId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { id: true, amount: true, riskLevel: true, trustScore: true, confirmStatus: true, buyerPhone: true, buyerWilaya: true, status: true, createdAt: true },
      }),
      prisma.operationOutcome.findMany({
        where: { organizationId: orgId, createdAt: { gte: weekAgo } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.operationEvent.findMany({
        where: { organizationId: orgId, createdAt: { gte: weekAgo } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.confirmationAttempt.findMany({
        where: { order: { organizationId: orgId }, createdAt: { gte: weekAgo } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.actionOutcomeAttribution.findMany({
        where: { organizationId: orgId, createdAt: { gte: weekAgo } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.operationOutcome.findMany({
        where: { organizationId: orgId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
      }),
    ])

    // ── Profile ──

    const totalAmount = orders.reduce((s, o) => s + Number(o.amount), 0)
    const avgOrderValue = orderCount > 0 ? Math.round(totalAmount / orderCount) : 0

    const busiestHours: number[] = []
    for (const o of orders) {
      const h = o.createdAt.getHours()
      busiestHours[h] = (busiestHours[h] ?? 0) + 1
    }
    let peakHour = 12
    let peakCount = 0
    let secondPeakHour = -1
    let secondPeakCount = 0
    for (let h = 0; h < 24; h++) {
      const c = busiestHours[h] ?? 0
      if (c > peakCount) { secondPeakHour = peakHour; secondPeakCount = peakCount; peakHour = h; peakCount = c }
      else if (c > secondPeakCount) { secondPeakHour = h; secondPeakCount = c }
    }

    const peakPeriodLabel = hourPeriod(peakHour)
    const secondPeakPeriodLabel = secondPeakHour >= 0 ? hourPeriod(secondPeakHour) : null

    const riskLevelCounts = { high: 0, medium: 0, low: 0 }
    for (const o of orders) {
      if (o.riskLevel === "high") riskLevelCounts.high++
      else if (o.riskLevel === "medium") riskLevelCounts.medium++
      else riskLevelCounts.low++
    }

    const confirmedOrders = orders.filter((o) => o.confirmStatus === "confirmed").length
    const confirmedRate = orderCount > 0 ? Math.round((confirmedOrders / orderCount) * 100) : 0

    const buyerResponseEvents = events.filter((e) => e.type === "buyer_replied" || e.type === "buyer_confirmed").length
    const totalContactAttempts = confirmationAttempts.length
    const buyerResponsiveness = totalContactAttempts > 0 ? Math.round((buyerResponseEvents / totalContactAttempts) * 100) : 0

    const trustMomentum = confirmedRate

    // Business rhythm description
    const hourlyVolume = peakCount
    let operationalIntensity: "high" | "moderate" | "steady" = "steady"
    if (hourlyVolume > 8) operationalIntensity = "high"
    else if (hourlyVolume > 3) operationalIntensity = "moderate"

    const periodName = hourLabel(peakHour)
    let businessRhythm: string
    if (hourlyVolume > 8) businessRhythm = `High-volume ${periodName.toLowerCase()} operations`
    else if (hourlyVolume > 3) businessRhythm = `${periodName} flow with steady volume`
    else businessRhythm = `Quiet, low-volume ${periodName.toLowerCase()} rhythm`

    let confirmationBehavior: string
    if (confirmedRate > 75) confirmationBehavior = "Fast-confirming buyers"
    else if (confirmedRate > 50) confirmationBehavior = "Moderate confirmation pace"
    else confirmationBehavior = "Cautious confirmation pattern"

    // ── Trends ──

    const prevWeekOutcomes = prevOutcomes.length
    const thisWeekOutcomes = outcomes.length
    const speedTrendVal = prevWeekOutcomes > 0 ? (thisWeekOutcomes - prevWeekOutcomes) / prevWeekOutcomes : 0
    const confirmationSpeedTrend: "improving" | "stable" | "declining" = speedTrendVal > 0.1 ? "improving" : speedTrendVal < -0.1 ? "declining" : "stable"

    const prevWeekResponseEvents = 0 // approximated from prev data
    const responseTrendVal = buyerResponsiveness > 30 ? 0.05 : -0.05
    const buyerResponsivenessTrend: "improving" | "stable" | "declining" = responseTrendVal > 0.05 ? "improving" : responseTrendVal < -0.05 ? "declining" : "stable"

    // ── High risk periods ──

    const highRiskPeriodNames: string[] = []
    const highRiskOrders = orders.filter((o) => o.riskLevel === "high")
    const highRiskByHour: number[] = []
    for (const o of highRiskOrders) {
      const h = o.createdAt.getHours()
      highRiskByHour[h] = (highRiskByHour[h] ?? 0) + 1
    }
    for (let h = 0; h < 24; h++) {
      const c = highRiskByHour[h] ?? 0
      if (c >= 2) highRiskPeriodNames.push(hourPeriod(h))
    }

    // ── Strongest sequence ──

    const seqCounts: Record<string, { count: number; revenue: number }> = {}
    for (const a of attributions) {
      const key = a.sequenceType ?? "manual"
      if (!seqCounts[key]) seqCounts[key] = { count: 0, revenue: 0 }
      seqCounts[key].count++
      seqCounts[key].revenue += Number(a.estimatedRevenueSaved)
    }
    let strongestSequence = "trust"
    let strongestScore = 0
    for (const [key, val] of Object.entries(seqCounts)) {
      const score = val.revenue > 0 ? val.revenue / val.count : val.count
      if (score > strongestScore) { strongestScore = score; strongestSequence = key }
    }
    const strongestSequenceLabel = SEQUENCE_LABELS[strongestSequence] ?? strongestSequence

    // ── Repeat buyer stability ──

    const uniquePhones = new Set(orders.map((o) => o.buyerPhone))
    const repeatRatio = orderCount > 0 ? 1 - uniquePhones.size / orderCount : 0
    const repeatBuyerStability = Math.round(repeatRatio * 100)

    // ── Seller style ──

    const styleKey = detectStyle(avgOrderValue, riskLevelCounts, orderCount, confirmedRate, buyerResponsiveness, repeatRatio, strongestSequence)
    const styleDef = STYLE_DEFS[styleKey]

    // ── Continuity messages ──

    const continuity: ContinuityMessage[] = []

    const weekOverWeekActions = thisWeekOutcomes - prevWeekOutcomes
    if (weekOverWeekActions > 2) continuity.push({ text: `Actions up ${weekOverWeekActions} from last week`, positive: true })
    else if (weekOverWeekActions < -2) continuity.push({ text: `Actions down ${Math.abs(weekOverWeekActions)} from last week`, positive: false })
    else continuity.push({ text: "Activity consistent with last week", positive: true })

    if (confirmationSpeedTrend === "improving") continuity.push({ text: "Confirmation speed improving", positive: true })
    else if (confirmationSpeedTrend === "declining") continuity.push({ text: "Confirmation speed slowing", positive: false })
    else continuity.push({ text: "Confirmation pace stable", positive: true })

    if (buyerResponsiveness > 50) continuity.push({ text: "Buyer response quality increasing", positive: true })
    else if (buyerResponsiveness > 20) continuity.push({ text: "Buyer engagement holding steady", positive: true })
    else continuity.push({ text: "Buyer response rates need attention", positive: false })

    if (repeatBuyerStability > 30) continuity.push({ text: "Repeat buyer base growing", positive: true })

    // ── Narrative ──

    let narrative: string
    if (orderCount === 0) narrative = "Start importing orders to see your operational profile"
    else if (confirmedRate > 75) narrative = `Your buyers confirm fast — ${strongestSequenceLabel} works best for your operation`
    else if (riskLevelCounts.high > 5) narrative = `${riskLevelCounts.high} high-risk orders handled — ${strongestSequenceLabel} is your strongest sequence`
    else if (repeatBuyerStability > 30) narrative = `${repeatBuyerStability}% repeat buyers — your operation builds trust naturally`
    else narrative = `${periodName} rhythm with ${avgOrderValue} TND average — ${confirmedRate}% confirmation rate`

    return {
      profile: {
        businessRhythm,
        averageOrderValue: avgOrderValue,
        operationalIntensity,
        confirmationBehavior,
        buyerResponsiveness,
        trustMomentum,
      },
      rhythm: {
        busiestHour: peakHour,
        peakPeriodLabel,
        secondPeakPeriodLabel,
        confirmationSpeedTrend,
        buyerResponsivenessTrend,
        highRiskPeriods: highRiskPeriodNames,
        strongestSequence: strongestSequenceLabel,
        repeatBuyerStability,
      },
      style: { style: styleKey, ...styleDef },
      continuity,
      narrative,
    }
  } catch {
    return {
      profile: {
        businessRhythm: "Building operational rhythm",
        averageOrderValue: 0,
        operationalIntensity: "steady",
        confirmationBehavior: "Getting started",
        buyerResponsiveness: 0,
        trustMomentum: 0,
      },
      rhythm: {
        busiestHour: 12,
        peakPeriodLabel: "Starting up",
        secondPeakPeriodLabel: null,
        confirmationSpeedTrend: "stable",
        buyerResponsivenessTrend: "stable",
        highRiskPeriods: [],
        strongestSequence: "trust",
        repeatBuyerStability: 0,
      },
      style: { style: "stable_operator", ...STYLE_DEFS.stable_operator },
      continuity: [{ text: "Setting up your operation", positive: true }],
      narrative: "Building your operational profile",
    }
  }
}

import { getEvents, getEventsByOrg, getRecentEvents } from "@/lib/events/event-store"
import type { EventRecord } from "@/lib/events/event-store"
import type { UgzioEvent } from "@/lib/events/event-bus"

export interface OrderStatusSummary {
  status: string
  count: number
}

export interface RiskTrend {
  averageScore: number
  maxScore: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  totalCalculated: number
}

export interface SystemState {
  totalOrders: number
  ordersByStatus: OrderStatusSummary[]
  flaggedOrders: number
  riskTrend: RiskTrend
  recentActivity: EventRecord[]
  lastComputed: string
  eventCount: number
}

function buildOrderStatusMap(orgId: string): Map<string, string> {
  const orderStatuses = new Map<string, string>()
  const createdEvents = getEvents({ types: ["ORDER_CREATED"] as UgzioEvent[], orgId })
  const updatedEvents = getEvents({ types: ["ORDER_UPDATED"] as UgzioEvent[], orgId })

  for (const e of createdEvents) {
    const p = e.payload as { orderId: string; orgId: string }
    orderStatuses.set(p.orderId, "CREATED")
  }

  for (const e of updatedEvents) {
    const p = e.payload as { orderId: string; newStatus: string }
    orderStatuses.set(p.orderId, p.newStatus)
  }

  return orderStatuses
}

function computeRiskTrend(orgId: string): RiskTrend {
  const riskEvents = getEvents({ types: ["RISK_CALCULATED"] as UgzioEvent[], orgId })

  if (riskEvents.length === 0) {
    return {
      averageScore: 0,
      maxScore: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      totalCalculated: 0,
    }
  }

  let totalScore = 0
  let maxScore = 0
  let high = 0
  let medium = 0
  let low = 0

  for (const e of riskEvents) {
    const p = e.payload as { riskScore: number; riskLevel: string }
    totalScore += p.riskScore
    if (p.riskScore > maxScore) maxScore = p.riskScore
    if (p.riskLevel === "high") high++
    else if (p.riskLevel === "medium") medium++
    else low++
  }

  return {
    averageScore: Math.round((totalScore / riskEvents.length) * 100) / 100,
    maxScore,
    highRiskCount: high,
    mediumRiskCount: medium,
    lowRiskCount: low,
    totalCalculated: riskEvents.length,
  }
}

export function computeSystemState(orgId: string): SystemState {
  const orderStatuses = buildOrderStatusMap(orgId)

  const statusCounts = new Map<string, number>()
  for (const status of orderStatuses.values()) {
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
  }

  const ordersByStatus: OrderStatusSummary[] = Array.from(statusCounts.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)

  const allFlagged = getEvents({ types: ["ORDER_FLAGGED"] as UgzioEvent[], orgId })
  const recentActivity = getEventsByOrg(orgId, 20)

  return {
    totalOrders: orderStatuses.size,
    ordersByStatus,
    flaggedOrders: allFlagged.length,
    riskTrend: computeRiskTrend(orgId),
    recentActivity,
    lastComputed: new Date().toISOString(),
    eventCount: getEvents({ orgId }).length,
  }
}

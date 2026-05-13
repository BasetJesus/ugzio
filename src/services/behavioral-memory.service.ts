import { prisma } from "@/lib/db"
import type { OperationEventType } from "./operation-timeline.service"

export interface OrderMemory {
  orderId: string
  sequenceHistory: string[]
  responseCount: number
  operatorActions: number
  communicationOutcomes: string[]
  totalEvents: number
  lastActivityAt: string | null
}

export interface BuyerMemory {
  buyerPhone: string
  previousConfirmations: number
  unreachableCount: number
  responseSpeedMinutes: number | null
  preferredSequence: string | null
  totalOrders: number
  successfulDeliveries: number
  failedDeliveries: number
}

export async function getOrderMemory(orgId: string, orderId: string): Promise<OrderMemory> {
  try {
    const events = await prisma.operationEvent.findMany({
      where: { organizationId: orgId, orderId },
      orderBy: { createdAt: "asc" },
    })

    const sequenceHistory: string[] = []
    let responseCount = 0
    let operatorActions = 0
    const communicationOutcomes: string[] = []

    for (const e of events) {
      const type = e.type as OperationEventType
      if (type === "sequence_selected" && e.metadata) {
        const meta = safeParseJson(e.metadata)
        if (meta?.sequenceType) sequenceHistory.push(meta.sequenceType as string)
      }
      if (type === "buyer_replied" || type === "buyer_confirmed") responseCount++
      if (type === "confirmed" || type === "cancelled" || type === "retry_scheduled" || type === "operator_note") operatorActions++
      if (type === "unreachable") communicationOutcomes.push("unreachable")
      if (type === "cancelled") communicationOutcomes.push("cancelled")
      if (type === "confirmed") communicationOutcomes.push("confirmed")
      if (type === "delivery_completed") communicationOutcomes.push("delivered")
    }

    return {
      orderId,
      sequenceHistory,
      responseCount,
      operatorActions,
      communicationOutcomes,
      totalEvents: events.length,
      lastActivityAt: events.length > 0 ? events[events.length - 1].createdAt.toISOString() : null,
    }
  } catch {
    return {
      orderId,
      sequenceHistory: [],
      responseCount: 0,
      operatorActions: 0,
      communicationOutcomes: [],
      totalEvents: 0,
      lastActivityAt: null,
    }
  }
}

export async function getBuyerMemory(orgId: string, buyerPhone: string): Promise<BuyerMemory> {
  try {
    const orders = await prisma.order.findMany({
      where: { organizationId: orgId, buyerPhone, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        operationOutcomes: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    })

    const previousConfirmations = orders.filter((o) =>
      o.confirmStatus === "confirmed" || o.status === "BUYER_CONFIRMED",
    ).length

    const unreachableCount = orders.filter((o) =>
      o.confirmStatus === "unreachable",
    ).length

    const successfulDeliveries = orders.filter((o) =>
      o.status === "DELIVERED" || o.status === "UGC_REQUESTED" || o.status === "UGC_RECEIVED",
    ).length

    const failedDeliveries = orders.filter((o) =>
      o.status === "REFUSED" || o.status === "INTELLIGENT_CANCEL",
    ).length

    const recentEvents = await prisma.operationEvent.findMany({
      where: {
        organizationId: orgId,
        orderId: { in: orders.map((o) => o.id) },
        type: { in: ["confirmed", "buyer_replied", "buyer_confirmed"] },
      },
      orderBy: { createdAt: "desc" },
      take: 2,
    })

    let responseSpeedMinutes: number | null = null
    if (recentEvents.length >= 2) {
      const first = new Date(recentEvents[recentEvents.length - 1].createdAt)
      const last = new Date(recentEvents[0].createdAt)
      responseSpeedMinutes = Math.round((last.getTime() - first.getTime()) / 60000)
    }

    const outcomes = orders.flatMap((o) => o.operationOutcomes)
    const sequenceTypes = outcomes
      .map((o) => o.actionTaken)
      .filter(Boolean)

    const preferredSequence = sequenceTypes.length > 0
      ? mostFrequent(sequenceTypes)
      : null

    return {
      buyerPhone,
      previousConfirmations,
      unreachableCount,
      responseSpeedMinutes,
      preferredSequence,
      totalOrders: orders.length,
      successfulDeliveries,
      failedDeliveries,
    }
  } catch {
    return {
      buyerPhone,
      previousConfirmations: 0,
      unreachableCount: 0,
      responseSpeedMinutes: null,
      preferredSequence: null,
      totalOrders: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
    }
  }
}

function mostFrequent(arr: string[]): string {
  const freq: Record<string, number> = {}
  let max = 0
  let result = arr[0] ?? ""
  for (const item of arr) {
    freq[item] = (freq[item] ?? 0) + 1
    if (freq[item] > max) {
      max = freq[item]
      result = item
    }
  }
  return result
}

function safeParseJson(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

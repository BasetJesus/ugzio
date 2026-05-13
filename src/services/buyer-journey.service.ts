import { prisma } from "@/lib/db"
import {
  JOURNEY_EVENT_TYPES,
  JOURNEY_EVENT_LABELS,
  isValidJourneyEventType,
} from "@/types/journey"
import type { JourneyEventRecord, JourneyEventType, BehaviorTag } from "@/types/journey"

export interface JourneyTimeline {
  orderId: string
  events: JourneyEventRecord[]
  behaviorTags: BehaviorTag[]
}

export interface CohortCount {
  eventType: JourneyEventType
  label: string
  count: number
  uniqueOrders: number
}

// ─── RECORD ────────────────────────────────────────────────────────

export async function recordJourneyEvent(
  orgId: string,
  orderId: string,
  eventType: string,
  metadata?: Record<string, unknown> | null,
  userId?: string,
): Promise<{ success: boolean }> {
  try {
    if (!isValidJourneyEventType(eventType)) {
      return { success: false }
    }

    await prisma.buyerJourneyEvent.create({
      data: {
        organizationId: orgId,
        orderId,
        eventType,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdByUserId: userId ?? null,
      },
    })

    return { success: true }
  } catch {
    return { success: false }
  }
}

// ─── TIMELINE ──────────────────────────────────────────────────────

export async function getOrderJourneyTimeline(
  orgId: string,
  orderId: string,
): Promise<JourneyTimeline> {
  try {
    const events = await prisma.buyerJourneyEvent.findMany({
      where: { organizationId: orgId, orderId },
      orderBy: { occurredAt: "asc" },
    })

    const mapped: JourneyEventRecord[] = events.map((e) => ({
      id: e.id,
      eventType: e.eventType as JourneyEventType,
      label: JOURNEY_EVENT_LABELS[e.eventType as JourneyEventType] ?? e.eventType,
      metadata: e.metadata ? safeParseJson(e.metadata) : null,
      occurredAt: e.occurredAt.toISOString(),
    }))

    const behaviorTags = deriveBehaviorTags(mapped)

    return { orderId, events: mapped, behaviorTags }
  } catch {
    return { orderId, events: [], behaviorTags: [] }
  }
}

// ─── COHORTS ───────────────────────────────────────────────────────

export async function getJourneyCohorts(
  orgId: string,
  eventTypes?: JourneyEventType[],
  days?: number,
): Promise<CohortCount[]> {
  try {
    const where: Record<string, unknown> = { organizationId: orgId }

    if (eventTypes && eventTypes.length > 0) {
      where.eventType = { in: eventTypes }
    }

    if (days && days > 0) {
      const since = new Date()
      since.setDate(since.getDate() - days)
      where.occurredAt = { gte: since }
    }

    const events = await prisma.buyerJourneyEvent.findMany({ where })

    const grouped = new Map<string, { count: number; orderIds: Set<string> }>()

    for (const e of events) {
      const existing = grouped.get(e.eventType) ?? { count: 0, orderIds: new Set() }
      existing.count++
      existing.orderIds.add(e.orderId)
      grouped.set(e.eventType, existing)
    }

    return Array.from(grouped.entries())
      .map(([eventType, data]) => ({
        eventType: eventType as JourneyEventType,
        label: JOURNEY_EVENT_LABELS[eventType as JourneyEventType] ?? eventType,
        count: data.count,
        uniqueOrders: data.orderIds.size,
      }))
      .sort((a, b) => b.count - a.count)
  } catch {
    return []
  }
}

// ─── BEHAVIOR TAGS ─────────────────────────────────────────────────

export function deriveBehaviorTags(events: JourneyEventRecord[]): BehaviorTag[] {
  const tags: BehaviorTag[] = []
  const eventTypes = new Set(events.map((e) => e.eventType))

  const hasResponded =
    eventTypes.has("BUYER_RESPONDED") || eventTypes.has("BUYER_CONFIRMED")
  const hasHesitation =
    eventTypes.has("BUYER_EXPRESSED_HESITATION") ||
    eventTypes.has("BUYER_REQUESTED_DELAY")
  const hasGhosted = eventTypes.has("BUYER_STOPPED_RESPONDING")
  const hasEngaged =
    eventTypes.has("BUYER_ACCEPTED_URGENCY") ||
    eventTypes.has("BUYER_ACCEPTED_REASSURANCE")
  const hasRetry = eventTypes.has("BUYER_RETRY_SCHEDULED")
  const hasNoResponse = eventTypes.has("BUYER_NO_RESPONSE")

  const contactAttempts = events.filter(
    (e) => e.eventType === "BUYER_CONTACT_ATTEMPTED",
  ).length

  const noResponseCount = events.filter(
    (e) => e.eventType === "BUYER_NO_RESPONSE",
  ).length

  if (hasResponded && !hasHesitation && !hasGhosted) {
    tags.push("responsive")
  }

  if (hasEngaged && hasResponded) {
    tags.push("engaged")
  }

  if (hasHesitation || (contactAttempts >= 2 && !hasResponded)) {
    tags.push("hesitant")
  }

  if (hasGhosted || (hasNoResponse && noResponseCount >= 2)) {
    tags.push("ghosting")
  }

  if (hasRetry || (contactAttempts >= 3 && !hasResponded)) {
    tags.push("high-friction")
  }

  if (tags.length === 0 && hasResponded) {
    tags.push("responsive")
  }

  if (tags.length === 0 && events.length > 0) {
    tags.push("hesitant")
  }

  return [...new Set(tags)]
}

// ─── HELPERS ───────────────────────────────────────────────────────

function safeParseJson(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

// ─── COHORT HELPER PRESETS ────────────────────────────────────────

export const COHORT_PRESETS: Record<
  string,
  { label: string; eventTypes: JourneyEventType[] }
> = {
  requestedDelay: {
    label: "Buyers requesting delays",
    eventTypes: ["BUYER_REQUESTED_DELAY"],
  },
  multipleRetries: {
    label: "Buyers with retries",
    eventTypes: ["BUYER_RETRY_SCHEDULED"],
  },
  hesitation: {
    label: "Buyers with hesitation",
    eventTypes: ["BUYER_EXPRESSED_HESITATION"],
  },
  respondedAfterSecondTry: {
    label: "Responded after second contact",
    eventTypes: ["BUYER_RESPONDED", "BUYER_CONTACT_ATTEMPTED"],
  },
}

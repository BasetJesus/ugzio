import type { UgzioEvent, EventPayloadMap } from "./event-bus"

export interface EventRecord<T extends UgzioEvent = UgzioEvent> {
  id: string
  type: T
  timestamp: string
  payload: EventPayloadMap[T]
}

export interface EventFilter {
  types?: UgzioEvent[]
  orgId?: string
  since?: string
  before?: string
}

let events: EventRecord[] = []

let counter = 0

export function appendEvent<T extends UgzioEvent>(
  type: T,
  payload: EventPayloadMap[T],
): EventRecord<T> {
  counter++
  const record: EventRecord<T> = {
    id: `evt_${Date.now()}_${counter}`,
    type,
    timestamp: new Date().toISOString(),
    payload,
  }
  events.push(record as EventRecord)
  return record
}

export function getEvents(filter?: EventFilter): EventRecord[] {
  if (!filter) return [...events]

  return events.filter((e) => {
    if (filter.types && !filter.types.includes(e.type)) return false
    if (filter.orgId && e.payload.orgId !== filter.orgId) return false
    if (filter.since && e.timestamp < filter.since) return false
    if (filter.before && e.timestamp > filter.before) return false
    return true
  })
}

export function getRecentEvents(limit: number = 50): EventRecord[] {
  return events.slice(-limit)
}

export function getEventsByOrg(orgId: string, limit: number = 100): EventRecord[] {
  return events
    .filter((e) => e.payload.orgId === orgId)
    .slice(-limit)
}

export function clearEvents(): void {
  events = []
  counter = 0
}

export function eventCount(): number {
  return events.length
}

export function eventCountByOrg(orgId: string): number {
  return events.filter((e) => e.payload.orgId === orgId).length
}

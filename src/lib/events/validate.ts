import { getEventCategory, LEGACY_EVENT_MAP } from "./taxonomy"
import type { EventType, EventPayloadMap } from "./taxonomy"

const BUS_EVENT_TYPES: ReadonlySet<string> = new Set([
  "order.created",
  "order.batch_imported",
  "order.status_changed",
  "risk.scored",
  "risk.order_flagged",
  "operator.confirmed",
  "operator.cancelled",
  "operator.marked_unreachable",
  "operator.verified_customer",
  "system.overview_refreshed",
])

const OPERATION_EVENT_TYPES: ReadonlySet<string> = new Set([
  "buyer.responded",
  "buyer.confirmed",
  "buyer.requested_delay",
  "operator.confirmed",
  "operator.marked_unreachable",
  "operator.cancelled",
  "operator.scheduled_retry",
  "operator.added_note",
  "comm.message_sent",
  "comm.whatsapp_opened",
  "comm.whatsapp_message_sent",
  "comm.sequence_selected",
  "ugc.requested",
  "ugc.received",
  "delivery.completed",
  "customer.story_shared",
  "customer.review_received",
  // legacy names still allowed
  "message_sent",
  "whatsapp_opened",
  "whatsapp_message_sent",
  "buyer_replied",
  "buyer_confirmed",
  "confirmed",
  "unreachable",
  "delayed_request",
  "cancelled",
  "retry_scheduled",
  "operator_note",
  "sequence_selected",
  "ugc_request_sent",
  "ugc_received",
  "delivery_completed",
  "customer_story_shared",
  "review_received",
])

// Required fields per bus event type (non-optional fields from payload interfaces)
const REQUIRED_FIELDS: Readonly<Record<string, readonly string[]>> = {
  "order.created": ["orderId", "orgId", "buyerName", "buyerPhone", "amount"],
  "order.batch_imported": ["orgId", "count", "orderIds"],
  "order.status_changed": ["orderId", "orgId", "previousStatus", "newStatus", "buyerName"],
  "risk.scored": ["orderId", "orgId", "riskScore", "riskLevel", "trustScore", "signals"],
  "risk.order_flagged": ["orderId", "orgId", "buyerPhone", "buyerName", "riskScore"],
  "operator.confirmed": ["orderId", "orgId", "buyerName", "buyerPhone", "amount", "confirmedBy", "method"],
  "operator.cancelled": ["orderId", "orgId", "buyerName", "buyerPhone", "reason", "cancelledBy"],
  "operator.marked_unreachable": ["orderId", "orgId", "buyerName", "buyerPhone", "attemptMethod"],
  "operator.verified_customer": ["orderId", "orgId", "buyerName", "buyerPhone", "verified", "trustDelta"],
  "system.overview_refreshed": ["timestamp", "source", "orgId"],
}

const ALL_CANONICAL: ReadonlySet<string> = new Set([
  "order.created", "order.batch_imported", "order.status_changed", "order.deleted",
  "risk.scored", "risk.order_flagged", "risk.suppressed",
  "operator.confirmed", "operator.cancelled", "operator.scheduled_retry",
  "operator.marked_unreachable", "operator.added_note", "operator.verified_customer",
  "buyer.contacted", "buyer.responded", "buyer.confirmed", "buyer.no_response",
  "buyer.requested_delay", "buyer.changed_address", "buyer.asked_questions",
  "buyer.hesitated", "buyer.stopped_responding", "buyer.refused",
  "buyer.accepted_urgency", "buyer.accepted_reassurance",
  "comm.message_sent", "comm.whatsapp_opened", "comm.whatsapp_message_sent",
  "comm.whatsapp_replied", "comm.sequence_selected",
  "delivery.shipped", "delivery.completed", "delivery.failed",
  "ugc.requested", "ugc.received", "ugc.approved", "ugc.rejected",
  "billing.order_counted", "billing.limit_reached",
  "activation.first_order", "activation.first_risk_score", "activation.first_verification",
  "customer.story_shared", "customer.review_received",
  "system.overview_refreshed",
])

let validationWarnings: number = 0

export function getValidationWarningCount(): number {
  return validationWarnings
}

export function resetValidationWarnings(): void {
  validationWarnings = 0
}

export function isValidCanonical(type: string): type is EventType {
  return ALL_CANONICAL.has(type)
}

export function isValidBusEvent(type: string): boolean {
  return BUS_EVENT_TYPES.has(type)
}

export function isValidOperationEvent(type: string): boolean {
  return OPERATION_EVENT_TYPES.has(type) || LEGACY_EVENT_MAP[type] !== undefined
}

export function isValidPayload(value: unknown): value is Record<string, unknown> {
  if (value === null || value === undefined) return false
  if (typeof value !== "object") return false
  if (Array.isArray(value)) return false
  return true
}

export function validateBusEvent(type: string, payload: unknown): void {
  const eventLabel = `[EventValidation] ${type}`

  if (!isValidCanonical(type)) {
    console.warn(`${eventLabel} — Unknown event type "${type}". Not in canonical taxonomy.`)
    validationWarnings++
    return
  }

  if (!isValidBusEvent(type)) {
    return
  }

  if (!isValidPayload(payload)) {
    console.warn(`${eventLabel} — Payload must be a non-null object, got ${typeof payload}`)
    validationWarnings++
    return
  }

  const required = REQUIRED_FIELDS[type]
  if (!required) return

  for (const field of required) {
    if (payload[field] === undefined || payload[field] === null) {
      console.warn(`${eventLabel} — Missing required field "${field}" in payload`)
      validationWarnings++
    }
  }
}

export function validateOperationEvent(type: string, metadata: unknown): void {
  const eventLabel = `[EventValidation] addEvent(${type})`

  if (!isValidOperationEvent(type)) {
    console.warn(`${eventLabel} — Unknown operation event type. Not in OperationEventType list.`)
    validationWarnings++
    return
  }

  if (metadata !== undefined && metadata !== null && !isValidPayload(metadata)) {
    console.warn(`${eventLabel} — Metadata must be a plain object or null, got ${typeof metadata}`)
    validationWarnings++
  }
}

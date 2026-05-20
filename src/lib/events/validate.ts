import type { OperationEventType } from "@/services/operation-timeline.service";

const OPERATION_EVENT_TYPES: ReadonlySet<string> = new Set([
  "order.created", "order.batch_imported", "order.status_changed", "order.completed",
  "risk.scored", "risk.order_flagged",
  "buyer.responded", "buyer.confirmed", "buyer.requested_delay",
  "operator.confirmed", "operator.marked_unreachable", "operator.cancelled",
  "operator.scheduled_retry", "operator.added_note", "operator.verified_customer",
  "comm.message_sent", "comm.whatsapp_opened", "comm.whatsapp_message_sent",
  "comm.sequence_selected", "ugc.requested", "ugc.received",
  "delivery.completed", "customer.story_shared", "customer.review_received",
  "system.overview_refreshed",
  // legacy names still allowed
  "message_sent", "whatsapp_opened", "whatsapp_message_sent",
  "buyer_replied", "buyer_confirmed", "confirmed", "unreachable",
  "delayed_request", "cancelled", "retry_scheduled", "operator_note",
  "sequence_selected", "ugc_request_sent", "ugc_received",
  "delivery_completed", "customer_story_shared", "review_received",
]);

let validationWarnings = 0;

export function getValidationWarningCount(): number {
  return validationWarnings;
}

export function resetValidationWarnings(): void {
  validationWarnings = 0;
}

export function isValidOperationEvent(type: string): type is OperationEventType {
  if (type.startsWith("journey.")) return true;
  return OPERATION_EVENT_TYPES.has(type);
}

export function isValidPayload(value: unknown): value is Record<string, unknown> {
  if (value === null || value === undefined) return false;
  if (typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  return true;
}

export function validateOperationEvent(type: string, metadata: unknown): void {
  const eventLabel = `[EventValidation] addEvent(${type})`;

  if (!isValidOperationEvent(type)) {
    console.warn(`${eventLabel} — Unknown operation event type.`);
    validationWarnings++;
    return;
  }

  if (metadata !== undefined && metadata !== null && !isValidPayload(metadata)) {
    console.warn(`${eventLabel} — Metadata must be a plain object or null, got ${typeof metadata}`);
    validationWarnings++;
  }
}

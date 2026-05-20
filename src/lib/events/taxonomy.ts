// ─── LEGACY → CANONICAL MAPPING ─────────────────────────────────────
// Maps legacy event names (SCREAMING_SNAKE / snake_case) to canonical dot-separated names.
// Canonical names are used in the OperationEvent table.

type CanonicalEvent = string;

export const LEGACY_EVENT_MAP: Record<string, CanonicalEvent> = {
  // Event bus (SCREAMING_SNAKE)
  ORDER_CREATED: "order.created",
  ORDER_COMPLETED: "order.completed",
  ORDER_UPDATED: "order.status_changed",
  BATCH_ORDERS_IMPORTED: "order.batch_imported",
  RISK_CALCULATED: "risk.scored",
  ORDER_FLAGGED: "risk.order_flagged",
  ORDER_CONFIRMED: "operator.confirmed",
  ORDER_CANCELLED: "operator.cancelled",
  ORDER_UNREACHABLE: "operator.marked_unreachable",
  CUSTOMER_VERIFIED: "operator.verified_customer",

  // Operation timeline (snake_case)
  message_sent: "comm.message_sent",
  whatsapp_opened: "comm.whatsapp_opened",
  whatsapp_message_sent: "comm.whatsapp_message_sent",
  buyer_replied: "buyer.responded",
  buyer_confirmed: "buyer.confirmed",
  confirmed: "operator.confirmed",
  unreachable: "operator.marked_unreachable",
  delayed_request: "buyer.requested_delay",
  cancelled: "operator.cancelled",
  retry_scheduled: "operator.scheduled_retry",
  operator_note: "operator.added_note",
  sequence_selected: "comm.sequence_selected",
  ugc_request_sent: "ugc.requested",
  ugc_received: "ugc.received",
  delivery_completed: "delivery.completed",
  customer_story_shared: "customer.story_shared",
  review_received: "customer.review_received",

  // Buyer journey (SCREAMING_SNAKE)
  BUYER_CONTACT_ATTEMPTED: "buyer.contacted",
  BUYER_RESPONDED: "buyer.responded",
  BUYER_NO_RESPONSE: "buyer.no_response",
  BUYER_CONFIRMED: "buyer.confirmed",
  BUYER_REQUESTED_DELAY: "buyer.requested_delay",
  BUYER_CHANGED_ADDRESS: "buyer.changed_address",
  BUYER_ASKED_QUESTIONS: "buyer.asked_questions",
  BUYER_EXPRESSED_HESITATION: "buyer.hesitated",
  BUYER_STOPPED_RESPONDING: "buyer.stopped_responding",
  BUYER_REFUSED: "buyer.refused",
  BUYER_ACCEPTED_URGENCY: "buyer.accepted_urgency",
  BUYER_ACCEPTED_REASSURANCE: "buyer.accepted_reassurance",
  BUYER_RETRY_SCHEDULED: "operator.scheduled_retry",
  ORDER_DELIVERED: "delivery.completed",
  UGC_REQUEST_SENT: "ugc.requested",
  UGC_RECEIVED: "ugc.received",
  CUSTOMER_STORY_SHARED: "customer.story_shared",
  REVIEW_RECEIVED: "customer.review_received",
  DELIVERY_SUCCESS: "delivery.completed",
}

export function toCanonical(legacy: string): string {
  return LEGACY_EVENT_MAP[legacy] ?? legacy
}

export const CANONICAL_TO_OPERATION_TYPE: Record<string, string> = {
  "comm.message_sent": "message_sent",
  "comm.whatsapp_opened": "whatsapp_opened",
  "comm.whatsapp_message_sent": "whatsapp_message_sent",
  "buyer.responded": "buyer_replied",
  "buyer.confirmed": "buyer_confirmed",
  "operator.confirmed": "confirmed",
  "operator.marked_unreachable": "unreachable",
  "buyer.requested_delay": "delayed_request",
  "operator.cancelled": "cancelled",
  "operator.scheduled_retry": "retry_scheduled",
  "operator.added_note": "operator_note",
  "comm.sequence_selected": "sequence_selected",
  "ugc.requested": "ugc_request_sent",
  "ugc.received": "ugc_received",
  "delivery.completed": "delivery_completed",
  "customer.story_shared": "customer_story_shared",
  "customer.review_received": "review_received",
}

export function toOperationType(canonical: string): string {
  return CANONICAL_TO_OPERATION_TYPE[canonical] ?? canonical
}

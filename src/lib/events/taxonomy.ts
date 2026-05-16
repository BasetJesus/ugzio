// ─── CANONICAL EVENT TAXONOMY ───────────────────────────────────────
// Single source of truth for all UGZIO events.
// Format: domain.event_name (past tense, dot-separated)

export const EventType = {
  // ── ORDER LIFECYCLE ──
  ORDER_CREATED: "order.created",
  ORDER_BATCH_IMPORTED: "order.batch_imported",
  ORDER_STATUS_CHANGED: "order.status_changed",
  ORDER_COMPLETED: "order.completed",
  ORDER_DELETED: "order.deleted",

  // ── RISK ──
  RISK_SCORED: "risk.scored",
  RISK_ORDER_FLAGGED: "risk.order_flagged",
  RISK_SUPPRESSED: "risk.suppressed",

  // ── OPERATOR ACTIONS ──
  OPERATOR_CONFIRMED: "operator.confirmed",
  OPERATOR_CANCELLED: "operator.cancelled",
  OPERATOR_SCHEDULED_RETRY: "operator.scheduled_retry",
  OPERATOR_MARKED_UNREACHABLE: "operator.marked_unreachable",
  OPERATOR_ADDED_NOTE: "operator.added_note",
  OPERATOR_VERIFIED_CUSTOMER: "operator.verified_customer",

  // ── BUYER INTERACTION ──
  BUYER_CONTACTED: "buyer.contacted",
  BUYER_RESPONDED: "buyer.responded",
  BUYER_CONFIRMED: "buyer.confirmed",
  BUYER_NO_RESPONSE: "buyer.no_response",
  BUYER_REQUESTED_DELAY: "buyer.requested_delay",
  BUYER_CHANGED_ADDRESS: "buyer.changed_address",
  BUYER_ASKED_QUESTIONS: "buyer.asked_questions",
  BUYER_HESITATED: "buyer.hesitated",
  BUYER_STOPPED_RESPONDING: "buyer.stopped_responding",
  BUYER_REFUSED: "buyer.refused",
  BUYER_ACCEPTED_URGENCY: "buyer.accepted_urgency",
  BUYER_ACCEPTED_REASSURANCE: "buyer.accepted_reassurance",

  // ── COMMUNICATION ──
  COMM_MESSAGE_SENT: "comm.message_sent",
  COMM_WHATSAPP_OPENED: "comm.whatsapp_opened",
  COMM_WHATSAPP_MESSAGE_SENT: "comm.whatsapp_message_sent",
  COMM_WHATSAPP_REPLIED: "comm.whatsapp_replied",
  COMM_SEQUENCE_SELECTED: "comm.sequence_selected",

  // ── DELIVERY ──
  DELIVERY_SHIPPED: "delivery.shipped",
  DELIVERY_COMPLETED: "delivery.completed",
  DELIVERY_FAILED: "delivery.failed",

  // ── UGC ──
  UGC_REQUESTED: "ugc.requested",
  UGC_RECEIVED: "ugc.received",
  UGC_APPROVED: "ugc.approved",
  UGC_REJECTED: "ugc.rejected",

  // ── BILLING ──
  BILLING_ORDER_COUNTED: "billing.order_counted",
  BILLING_LIMIT_REACHED: "billing.limit_reached",

  // ── ACTIVATION ──
  ACTIVATION_FIRST_ORDER: "activation.first_order",
  ACTIVATION_FIRST_RISK: "activation.first_risk_score",
  ACTIVATION_FIRST_VERIFIED: "activation.first_verification",

  // ── CUSTOMER ──
  CUSTOMER_STORY_SHARED: "customer.story_shared",
  CUSTOMER_REVIEW_RECEIVED: "customer.review_received",

  // ── SYSTEM ──
  SYSTEM_OVERVIEW_REFRESHED: "system.overview_refreshed",
} as const

export type EventType = (typeof EventType)[keyof typeof EventType]

export const EVENT_CATEGORY = {
  ORDER_LIFECYCLE: "order" as const,
  RISK: "risk" as const,
  OPERATOR_ACTION: "operator" as const,
  BUYER_INTERACTION: "buyer" as const,
  COMMUNICATION: "comm" as const,
  DELIVERY: "delivery" as const,
  UGC: "ugc" as const,
  BILLING: "billing" as const,
  ACTIVATION: "activation" as const,
  SYSTEM: "system" as const,
} as const

export type EventCategory = (typeof EVENT_CATEGORY)[keyof typeof EVENT_CATEGORY]

export function getEventCategory(eventType: EventType): EventCategory {
  return eventType.split(".")[0] as EventCategory
}

export function getEventLabel(eventType: EventType): string {
  const LABELS: Record<EventType, string> = {
    "order.created": "Order created",
    "order.batch_imported": "Batch imported",
    "order.status_changed": "Status changed",
    "order.completed": "Order completed",
    "order.deleted": "Order deleted",
    "risk.scored": "Risk scored",
    "risk.order_flagged": "Flagged",
    "risk.suppressed": "Risk suppressed",
    "operator.confirmed": "Confirmed",
    "operator.cancelled": "Cancelled",
    "operator.scheduled_retry": "Retry scheduled",
    "operator.marked_unreachable": "Unreachable",
    "operator.added_note": "Note added",
    "operator.verified_customer": "Customer verified",
    "buyer.contacted": "Contact attempted",
    "buyer.responded": "Buyer responded",
    "buyer.confirmed": "Buyer confirmed",
    "buyer.no_response": "No response",
    "buyer.requested_delay": "Requested delay",
    "buyer.changed_address": "Changed address",
    "buyer.asked_questions": "Asked questions",
    "buyer.hesitated": "Expressed hesitation",
    "buyer.stopped_responding": "Stopped responding",
    "buyer.refused": "Refused",
    "buyer.accepted_urgency": "Accepted urgency",
    "buyer.accepted_reassurance": "Accepted reassurance",
    "comm.message_sent": "Message sent",
    "comm.whatsapp_opened": "WhatsApp opened",
    "comm.whatsapp_message_sent": "WhatsApp sent",
    "comm.whatsapp_replied": "WhatsApp replied",
    "comm.sequence_selected": "Sequence selected",
    "delivery.shipped": "Shipped",
    "delivery.completed": "Delivered",
    "delivery.failed": "Delivery failed",
    "ugc.requested": "UGC requested",
    "ugc.received": "UGC received",
    "ugc.approved": "UGC approved",
    "ugc.rejected": "UGC rejected",
    "billing.order_counted": "Order counted",
    "billing.limit_reached": "Limit reached",
    "activation.first_order": "First order",
    "activation.first_risk_score": "First risk score",
    "activation.first_verification": "First verification",
    "customer.story_shared": "Story shared",
    "customer.review_received": "Review received",
    "system.overview_refreshed": "Overview refreshed",
  }
  return LABELS[eventType] ?? eventType
}

// ─── EVENT PAYLOADS ─────────────────────────────────────────────────

export interface OrderCreatedPayload {
  orderId: string
  orgId: string
  buyerName: string
  buyerPhone: string
  amount: number
  product: string | null
}

export interface OrderCompletedPayload {
  orderId: string
  orgId: string
  status: string
  buyerName: string
  buyerPhone: string
  amount: number
  outcome: "SUCCESS" | "FAILURE"
}

export interface OrderBatchImportedPayload {
  orgId: string
  count: number
  orderIds: string[]
}

export interface OrderStatusChangedPayload {
  orderId: string
  orgId: string
  previousStatus: string
  newStatus: string
  buyerName: string
}

export interface RiskScoredPayload {
  orderId: string
  orgId: string
  riskScore: number
  riskLevel: string
  trustScore: number
  signals: string[]
}

export interface RiskOrderFlaggedPayload {
  orderId: string
  orgId: string
  buyerPhone: string
  buyerName: string
  riskScore: number
}

export interface OperatorConfirmedPayload {
  orderId: string
  orgId: string
  buyerName: string
  buyerPhone: string
  amount: number
  confirmedBy: string
  method: string
  revenueSaved?: number
}

export interface OperatorCancelledPayload {
  orderId: string
  orgId: string
  buyerName: string
  buyerPhone: string
  reason: string
  cancelledBy: string
  lossPrevented?: number
}

export interface OperatorMarkedUnreachablePayload {
  orderId: string
  orgId: string
  buyerName: string
  buyerPhone: string
  attemptMethod: string
}

export interface OperatorVerifiedCustomerPayload {
  orderId: string
  orgId: string
  buyerName: string
  buyerPhone: string
  verified: boolean
  trustDelta: number
}

export interface SystemOverviewRefreshedPayload {
  timestamp: string
  source: string
  orgId: string
}

export type EventPayloadMap = {
  "order.created": OrderCreatedPayload
  "order.batch_imported": OrderBatchImportedPayload
  "order.status_changed": OrderStatusChangedPayload,
  "order.completed": OrderCompletedPayload,
  "order.deleted": never
  "risk.scored": RiskScoredPayload
  "risk.order_flagged": RiskOrderFlaggedPayload
  "risk.suppressed": never
  "operator.confirmed": OperatorConfirmedPayload
  "operator.cancelled": OperatorCancelledPayload
  "operator.scheduled_retry": never
  "operator.marked_unreachable": OperatorMarkedUnreachablePayload
  "operator.added_note": never
  "operator.verified_customer": OperatorVerifiedCustomerPayload
  "buyer.contacted": never
  "buyer.responded": never
  "buyer.confirmed": never
  "buyer.no_response": never
  "buyer.requested_delay": never
  "buyer.changed_address": never
  "buyer.asked_questions": never
  "buyer.hesitated": never
  "buyer.stopped_responding": never
  "buyer.refused": never
  "buyer.accepted_urgency": never
  "buyer.accepted_reassurance": never
  "comm.message_sent": never
  "comm.whatsapp_opened": never
  "comm.whatsapp_message_sent": never
  "comm.whatsapp_replied": never
  "comm.sequence_selected": never
  "delivery.shipped": never
  "delivery.completed": never
  "delivery.failed": never
  "ugc.requested": never
  "ugc.received": never
  "ugc.approved": never
  "ugc.rejected": never
  "billing.order_counted": never
  "billing.limit_reached": never
  "activation.first_order": never
  "activation.first_risk_score": never
  "activation.first_verification": never
  "customer.story_shared": never
  "customer.review_received": never
  "system.overview_refreshed": SystemOverviewRefreshedPayload
}

// ─── LEGACY → CANONICAL MAPPING ─────────────────────────────────────
// All three legacy naming systems (event bus, operation timeline, journey)
// map through this single table.

export const LEGACY_EVENT_MAP: Record<string, EventType> = {
  // ── Event bus (SCREAMING_SNAKE) ──
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
  OVERVIEW_REFRESHED: "system.overview_refreshed",

  // ── Operation timeline (snake_case) ──
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

  // ── Buyer journey (SCREAMING_SNAKE, same names as bus for different events) ──
  BUYER_CONTACT_ATTEMPTED: "buyer.contacted",
  BUYER_RESPONDED: "buyer.responded",
  BUYER_NO_RESPONSE: "buyer.no_response",
  BUYER_CONFIRMED: "buyer.confirmed",          // key collision safe: same string means same canonical
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

export function toCanonical(legacy: string): EventType {
  return LEGACY_EVENT_MAP[legacy] ?? (legacy as EventType)
}

// ─── CANONICAL → LEGACY REVERSE MAP (for backward compat) ──────────

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

export function toOperationType(canonical: EventType): string {
  return CANONICAL_TO_OPERATION_TYPE[canonical] ?? canonical
}

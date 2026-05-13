export const JOURNEY_EVENT_TYPES = {
  BUYER_CONTACT_ATTEMPTED: "BUYER_CONTACT_ATTEMPTED",
  BUYER_RESPONDED: "BUYER_RESPONDED",
  BUYER_NO_RESPONSE: "BUYER_NO_RESPONSE",
  BUYER_CONFIRMED: "BUYER_CONFIRMED",
  BUYER_REQUESTED_DELAY: "BUYER_REQUESTED_DELAY",
  BUYER_CHANGED_ADDRESS: "BUYER_CHANGED_ADDRESS",
  BUYER_ASKED_QUESTIONS: "BUYER_ASKED_QUESTIONS",
  BUYER_EXPRESSED_HESITATION: "BUYER_EXPRESSED_HESITATION",
  BUYER_STOPPED_RESPONDING: "BUYER_STOPPED_RESPONDING",
  BUYER_REFUSED: "BUYER_REFUSED",
  BUYER_ACCEPTED_URGENCY: "BUYER_ACCEPTED_URGENCY",
  BUYER_ACCEPTED_REASSURANCE: "BUYER_ACCEPTED_REASSURANCE",
  BUYER_RETRY_SCHEDULED: "BUYER_RETRY_SCHEDULED",
  ORDER_DELIVERED: "ORDER_DELIVERED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  UGC_REQUEST_SENT: "UGC_REQUEST_SENT",
  UGC_RECEIVED: "UGC_RECEIVED",
  CUSTOMER_STORY_SHARED: "CUSTOMER_STORY_SHARED",
  REVIEW_RECEIVED: "REVIEW_RECEIVED",
  DELIVERY_SUCCESS: "DELIVERY_SUCCESS",
} as const

export type JourneyEventType = (typeof JOURNEY_EVENT_TYPES)[keyof typeof JOURNEY_EVENT_TYPES]

export const JOURNEY_EVENT_LABELS: Record<JourneyEventType, string> = {
  BUYER_CONTACT_ATTEMPTED: "Contact attempted",
  BUYER_RESPONDED: "Buyer responded",
  BUYER_NO_RESPONSE: "No response",
  BUYER_CONFIRMED: "Buyer confirmed",
  BUYER_REQUESTED_DELAY: "Buyer requested delay",
  BUYER_CHANGED_ADDRESS: "Buyer changed address",
  BUYER_ASKED_QUESTIONS: "Buyer asked questions",
  BUYER_EXPRESSED_HESITATION: "Buyer expressed hesitation",
  BUYER_STOPPED_RESPONDING: "Buyer stopped responding",
  BUYER_REFUSED: "Buyer refused",
  BUYER_ACCEPTED_URGENCY: "Accepted urgency",
  BUYER_ACCEPTED_REASSURANCE: "Accepted reassurance",
  BUYER_RETRY_SCHEDULED: "Retry scheduled",
  ORDER_DELIVERED: "Delivered",
  ORDER_CANCELLED: "Cancelled",
  UGC_REQUEST_SENT: "UGC request sent",
  UGC_RECEIVED: "UGC received",
  CUSTOMER_STORY_SHARED: "Customer shared story",
  REVIEW_RECEIVED: "Review received",
  DELIVERY_SUCCESS: "Delivery completed",
}

export type BehaviorTag = "responsive" | "hesitant" | "ghosting" | "engaged" | "high-friction"

export const BEHAVIOR_TAG_LABELS: Record<BehaviorTag, string> = {
  responsive: "Responsive",
  hesitant: "Hesitant",
  ghosting: "Ghosting",
  engaged: "Engaged",
  "high-friction": "High Friction",
}

export function isValidJourneyEventType(value: string): value is JourneyEventType {
  return Object.values(JOURNEY_EVENT_TYPES).includes(value as JourneyEventType)
}

export const EVENT_TYPE_ORDER_BASE = 1

export interface JourneyEventRecord {
  id: string
  eventType: JourneyEventType
  label: string
  metadata: Record<string, unknown> | null
  occurredAt: string
}

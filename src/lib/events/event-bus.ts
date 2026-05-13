import { EventEmitter } from "events"
import { appendEvent } from "./event-store"

export const ORDER_EVENTS = {
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_UPDATED: "ORDER_UPDATED",
  BATCH_ORDERS_IMPORTED: "BATCH_ORDERS_IMPORTED",
} as const

export const RISK_EVENTS = {
  RISK_CALCULATED: "RISK_CALCULATED",
  ORDER_FLAGGED: "ORDER_FLAGGED",
} as const

export const CONFIRM_EVENTS = {
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  ORDER_UNREACHABLE: "ORDER_UNREACHABLE",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  CUSTOMER_VERIFIED: "CUSTOMER_VERIFIED",
} as const

export const OVERVIEW_EVENTS = {
  OVERVIEW_REFRESHED: "OVERVIEW_REFRESHED",
} as const

export const UGZIO_EVENTS = {
  ...ORDER_EVENTS,
  ...RISK_EVENTS,
  ...CONFIRM_EVENTS,
  ...OVERVIEW_EVENTS,
} as const

export type UgzioEvent = (typeof UGZIO_EVENTS)[keyof typeof UGZIO_EVENTS]

export interface OrderCreatedPayload {
  orderId: string
  orgId: string
  buyerName: string
  buyerPhone: string
  amount: number
  product: string | null
}

export interface OrderUpdatedPayload {
  orderId: string
  orgId: string
  previousStatus: string
  newStatus: string
  buyerName: string
}

export interface RiskCalculatedPayload {
  orderId: string
  orgId: string
  riskScore: number
  riskLevel: string
  trustScore: number
  signals: string[]
}

export interface OrderFlaggedPayload {
  orderId: string
  orgId: string
  buyerPhone: string
  buyerName: string
  riskScore: number
}

export interface OrderConfirmedPayload {
  orderId: string
  orgId: string
  buyerName: string
  buyerPhone: string
  amount: number
  confirmedBy: string
  method: string
  revenueSaved?: number
}

export interface OrderUnreachablePayload {
  orderId: string
  orgId: string
  buyerName: string
  buyerPhone: string
  attemptMethod: string
}

export interface OrderCancelledPayload {
  orderId: string
  orgId: string
  buyerName: string
  buyerPhone: string
  reason: string
  cancelledBy: string
  lossPrevented?: number
}

export interface BatchOrdersImportedPayload {
  orgId: string
  count: number
  orderIds: string[]
}

export interface CustomerVerifiedPayload {
  orderId: string
  orgId: string
  buyerName: string
  buyerPhone: string
  verified: boolean
  trustDelta: number
}

export interface OverviewRefreshedPayload {
  timestamp: string
  source: string
  orgId: string
}

export interface EventPayloadMap {
  ORDER_CREATED: OrderCreatedPayload
  ORDER_UPDATED: OrderUpdatedPayload
  BATCH_ORDERS_IMPORTED: BatchOrdersImportedPayload
  RISK_CALCULATED: RiskCalculatedPayload
  ORDER_FLAGGED: OrderFlaggedPayload
  ORDER_CONFIRMED: OrderConfirmedPayload
  ORDER_UNREACHABLE: OrderUnreachablePayload
  ORDER_CANCELLED: OrderCancelledPayload
  CUSTOMER_VERIFIED: CustomerVerifiedPayload
  OVERVIEW_REFRESHED: OverviewRefreshedPayload
}

const emitter = new EventEmitter()
emitter.setMaxListeners(100)

export function emit<T extends UgzioEvent>(event: T, payload: EventPayloadMap[T]): void {
  appendEvent(event, payload)
  emitter.emit(event, payload)
}

export function on<T extends UgzioEvent>(
  event: T,
  handler: (payload: EventPayloadMap[T]) => void,
): () => void {
  emitter.on(event, handler as (...args: unknown[]) => void)
  return () => {
    emitter.off(event, handler as (...args: unknown[]) => void)
  }
}

export function once<T extends UgzioEvent>(
  event: T,
  handler: (payload: EventPayloadMap[T]) => void,
): void {
  emitter.once(event, handler as (...args: unknown[]) => void)
}

export function removeAllListeners(event?: UgzioEvent): void {
  if (event) {
    emitter.removeAllListeners(event)
  } else {
    emitter.removeAllListeners()
  }
}

export function listenerCount(event: UgzioEvent): number {
  return emitter.listenerCount(event)
}

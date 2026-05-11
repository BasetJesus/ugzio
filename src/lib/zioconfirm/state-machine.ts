export type OrderStatus =
  | "CREATED"
  | "PRE_SHIPPING_CONFIRM_SENT"
  | "BUYER_CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "UGC_REQUESTED"
  | "UGC_RECEIVED"
  | "INTELLIGENT_CANCEL"
  | "PENDING_RESCHEDULE"
  | "REFUSED";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ["PRE_SHIPPING_CONFIRM_SENT"],
  PRE_SHIPPING_CONFIRM_SENT: ["BUYER_CONFIRMED", "INTELLIGENT_CANCEL", "PENDING_RESCHEDULE"],
  BUYER_CONFIRMED: ["SHIPPED", "INTELLIGENT_CANCEL"],
  SHIPPED: ["DELIVERED", "REFUSED"],
  DELIVERED: ["UGC_REQUESTED"],
  UGC_REQUESTED: ["UGC_RECEIVED"],
  UGC_RECEIVED: [],
  INTELLIGENT_CANCEL: [],
  PENDING_RESCHEDULE: ["PRE_SHIPPING_CONFIRM_SENT", "INTELLIGENT_CANCEL"],
  REFUSED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function transitionStatus(from: OrderStatus, to: OrderStatus): OrderStatus {
  if (!canTransition(from, to)) throw new Error(`Invalid order transition: ${from} → ${to}`);
  return to;
}

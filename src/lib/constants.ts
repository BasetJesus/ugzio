// ── Order Status Values ──
export const ORDER_STATUS = {
  CREATED: "CREATED",
  PRE_SHIPPING_CONFIRM_SENT: "PRE_SHIPPING_CONFIRM_SENT",
  BUYER_CONFIRMED: "BUYER_CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  UGC_REQUESTED: "UGC_REQUESTED",
  UGC_RECEIVED: "UGC_RECEIVED",
  INTELLIGENT_CANCEL: "INTELLIGENT_CANCEL",
  PENDING_RESCHEDULE: "PENDING_RESCHEDULE",
  REFUSED: "REFUSED",
} as const;

// ── Risk Levels ──
export const RISK = {
  LOW: "low" as const,
  MEDIUM: "medium" as const,
  HIGH: "high" as const,
};

// ── Activation Events ──
export const ACTIVATION_EVENTS = {
  FIRST_ORDER_CREATED: "FIRST_ORDER_CREATED",
  FIRST_VERIFICATION_SENT: "FIRST_VERIFICATION_SENT",
  FIRST_TRUST_SCORE: "FIRST_TRUST_SCORE",
  FIRST_HIGH_RISK_BLOCKED: "FIRST_HIGH_RISK_BLOCKED",
} as const;

// ── Timeline Event Types ──
export const TIMELINE_EVENTS = {
  ANTICIPATION: "ANTICIPATION",
  SOCIAL_PROOF: "SOCIAL_PROOF",
  VISUAL_OWNERSHIP: "VISUAL_OWNERSHIP",
  PRE_DELIVERY_CONFIRM: "PRE_DELIVERY_CONFIRM",
  D3_UGC_ASK: "D3_UGC_ASK",
} as const;

// ── Plan Tiers ──
export const PLANS = {
  FREE: "free",
  CROISSANCE: "croissance",
} as const;

export const FREE_TIER_LIMIT = 3;

// ── Subscription Status ──
export const SUBSCRIPTION_STATUS = {
  FREE: "free",
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
} as const;

// ── Timing Constants ──
export const MS_IN_HOUR = 60 * 60 * 1000;
export const MS_IN_DAY = 24 * MS_IN_HOUR;

export const PSYCHOLOGICAL_SEQUENCE = {
  ANTICIPATION_DELAY_H: 2,
  SOCIAL_PROOF_DELAY_H: 12,
  VISUAL_OWNERSHIP_DELAY_H: 24,
} as const;

export const PRE_DELIVERY_CONFIRM_WINDOW_H = 20;
export const D3_UGC_ASK_DELAY_H = 72;

// ── API Paths ──
export const API = {
  ORDERS: "/api/v1/orders",
  ZIO_SHIELD_SCORE: "/api/v1/zioshield/score",
  ZIO_SHIELD_RISK: "/api/v1/zioshield/risk",
  ZIO_SHIELD_BLACKLIST: "/api/v1/zioshield/blacklist",
  ZIO_CONFIRM_SEND: "/api/v1/zioconfirm/send",
  CONVERSATIONS: "/api/v1/conversations",
  GENERATE: "/api/generate",
} as const;

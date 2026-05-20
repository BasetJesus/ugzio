/* ─── BILLING ─── */

export interface Plan {
  id: string
  name: string
  maxOrdersPerMonth: number
  maxUsersPerOrg: number
  hasZioConfirm: boolean
  hasZioBrain: boolean
  hasZioConnect: boolean
  hasZioFlow: boolean
  hasZioNetwork: boolean
  aiInsightsPerMonth: number
  verificationsPerMonth: number
  price: number
  currency: string
}

export interface Subscription {
  id: string
  organizationId: string
  planId: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  konnectSubscriptionId?: string
  canceledAt?: string
  createdAt: string
}

/* ─── ORGANIZATION & USERS ─── */

export interface Organization {
  id: string
  name: string
  slug: string
  maxOrdersPerMonth: number
  subscriptionStatus: string
  ordersThisMonth: number
  sellerPhone?: string
  sellerName?: string
  brandDescription?: string
  logo?: string
  socialLinks?: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  createdAt: string
}

/* ─── ORDERS ─── */

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
  | "REFUSED"

export type RiskLevel = "low" | "medium" | "high"

export interface Customer {
  name: string
  phone: string
  initial: string
  verified?: boolean
}

export interface CustomerHistory {
  total: number
  completed: number
  cancelled: number
  rtsRate: number
}

export interface Order {
  id: string
  token: string
  organizationId: string
  buyerName: string
  buyerPhone: string
  product?: string
  buyerWilaya?: string
  buyerAddress?: string
  amount: number
  currency: string
  riskLevel: RiskLevel
  trustScore: number
  mlScore?: number
  status: OrderStatus
  source?: string
  externalId?: string
  createdAt: string
}

/* ─── RISK ─── */

export interface RiskScore {
  score: number
  level: RiskLevel
  signals: string[]
}

export interface RiskEvaluation {
  id: string
  orderId: string
  riskScore: number
  riskLevel: RiskLevel
  riskSignals: string[]
  recommendedAction: string
  evaluatedAt: string
}

/* ─── ACTIVITY ─── */

export type ActivityType =
  | "order_created"
  | "risk_flagged"
  | "confirmation_sent"
  | "buyer_confirmed"
  | "shipped"
  | "delivered"
  | "ugc_received"
  | "canceled"

export interface Activity {
  id: string
  type: ActivityType
  message: string
  orderRef?: string
  timestamp: string
  relativeTime: string
}

/* ─── UGC ─── */

export interface UGCItem {
  id: string
  orderId: string
  mediaUrl: string
  mediaType: "image" | "video"
  buyerPhone: string
  status: "received" | "approved" | "rejected"
  createdAt: string
}

/* ─── CHANNEL STATS ─── */

export interface ChannelStat {
  platform: string
  label: string
  postsCount: number
  engagement: number
  conversions: number
}

/* ─── DASHBOARD KPI ─── */

export interface KpiData {
  label: string
  value: string | number
  change: number
  changeLabel?: string
  sparklineData?: number[]
  invertColor?: boolean
}

/* ─── TABLE PAGINATION ─── */

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

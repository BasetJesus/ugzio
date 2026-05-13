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

export type RiskLevel = "low" | "medium" | "high";

export type VerificationStatus = "none" | "pending" | "confirmed" | "failed";

export interface OrderSummary {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerWilaya: string | null;
  product: string | null;
  amount: number;
  riskLevel: RiskLevel;
  trustScore: number;
  status: OrderStatus;
  createdAt: string;
}

export interface CreateOrderInput {
  buyerName: string;
  buyerPhone: string;
  product?: string;
  amount: number;
  buyerWilaya?: string;
  organizationId: string;
}

export interface OrderDetail extends OrderSummary {
  timeline: TimelineEntry[];
  ugcItems: UgcItem[];
  conversations: ConversationRef[];
}

export interface TimelineEntry {
  id: string;
  eventType: string;
  scheduledFor: Date;
  sentAt: Date | null;
  status: string;
}

export interface UgcItem {
  id: string;
  mediaUrl: string;
  mediaType: string;
  status: string;
}

export interface ConversationRef {
  id: string;
}

export type DeliveryState = "on_time" | "delayed" | "at_risk" | "delivered" | "returned";

export type PaymentStatus = "pending" | "confirmed" | "failed" | "refunded";

export interface OrderTableItem {
  id: string;
  customer: {
    name: string;
    phone: string;
    wilaya: string | null;
  };
  product: string | null;
  amount: number;
  status: OrderStatus;
  riskLevel: RiskLevel;
  trustScore: number;
  paymentStatus: PaymentStatus;
  deliveryState: DeliveryState;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersPageData {
  stats: {
    total: number;
    atRisk: number;
    pendingToday: number;
    revenueTotal: number;
    deliveredRate: number;
  };
  orders: OrderTableItem[];
}

export interface BuyerIdentity {
  id: string;
  phoneE164: string;
  anonymizedId: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  createdAt: Date;
}

export interface ConversationSummary {
  id: string;
  buyerName: string;
  buyerPhone: string;
  trustScore: number;
  orderStatus: string;
  lastMessageAt: string;
  organizationId: string;
}

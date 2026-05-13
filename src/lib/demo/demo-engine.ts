import type { OrderStatus, RiskLevel, OrderTableItem, OrdersPageData, DeliveryState, PaymentStatus } from "@/types/order";
import type { ConfirmStatus } from "@/services/confirmation.service";
import type { OverviewData, OverviewStats, LiveOrder, RiskAlert } from "@/services/overview.service";
import type { ConfirmationQueue, ConfirmationQueueItem } from "@/services/confirmation.service";
import {
  DEMO_FIRST_NAMES, DEMO_LAST_NAMES, DEMO_WILAYAS, DEMO_PRODUCTS,
  DEMO_DELIVERY_PROVIDERS, pickRandom, generatePhone, generateAmount,
  generateRiskScore, generateStatus, generateConfirmStatus,
} from "./demo-orders";

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface DemoOrderState {
  confirmStatus: ConfirmStatus;
  status: OrderStatus;
}

export interface DemoOrderData {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerWilaya: string | null;
  product: string | null;
  amount: number;
  riskLevel: RiskLevel;
  trustScore: number;
  riskScore: number;
  status: OrderStatus;
  confirmStatus: ConfirmStatus;
  deliveryProvider: string;
  createdAt: string;
  updatedAt: string;
}

export interface DemoOrgState {
  orders: Map<string, DemoOrderData>;
  initialized: boolean;
}

const orgStates = new Map<string, DemoOrgState>();

function getOrCreateOrgState(orgId: string): DemoOrgState {
  let state = orgStates.get(orgId);
  if (!state) {
    state = { orders: new Map(), initialized: false };
    orgStates.set(orgId, state);
  }
  return state;
}

export function resetDemoState(orgId: string): void {
  orgStates.delete(orgId);
}

function paymentFromStatus(status: OrderStatus): PaymentStatus {
  if (status === "DELIVERED" || status === "BUYER_CONFIRMED") return "confirmed";
  if (status === "REFUSED" || status === "INTELLIGENT_CANCEL") return "failed";
  if (status === "CREATED" || status === "PRE_SHIPPING_CONFIRM_SENT") return "pending";
  return "confirmed";
}

function deliveryFromStatus(status: OrderStatus): DeliveryState {
  switch (status) {
    case "DELIVERED": case "UGC_REQUESTED": case "UGC_RECEIVED": return "delivered";
    case "SHIPPED": return "on_time";
    case "REFUSED": return "returned";
    case "INTELLIGENT_CANCEL": case "PENDING_RESCHEDULE": return "at_risk";
    default: return "delayed";
  }
}

function buildOrders(orgId: string): DemoOrderData[] {
  const state = getOrCreateOrgState(orgId);
  if (state.initialized) {
    return Array.from(state.orders.values());
  }

  const seed = hashString(orgId);
  const rand = mulberry32(seed);
  const count = 15 + Math.floor(rand() * 16);
  const now = Date.now();
  const orders: DemoOrderData[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = pickRandom(DEMO_FIRST_NAMES, rand);
    const lastName = pickRandom(DEMO_LAST_NAMES, rand);
    const buyerName = `${firstName} ${lastName}`;
    const buyerPhone = generatePhone(rand);
    const buyerWilaya = pickRandom(DEMO_WILAYAS, rand);
    const product = pickRandom(DEMO_PRODUCTS, rand);
    const amount = generateAmount(rand);
    const riskScore = generateRiskScore(amount, rand);
    const trustScore = Math.max(0, Math.min(100, 100 - riskScore));
    const riskLevel: RiskLevel = riskScore < 30 ? "low" : riskScore <= 60 ? "medium" : "high";
    const status = generateStatus(riskScore, rand);
    const confirmStatus = generateConfirmStatus(status, riskScore, rand);
    const deliveryProvider = pickRandom(DEMO_DELIVERY_PROVIDERS, rand);
    const hoursAgo = Math.floor(rand() * 720);
    const createdAt = new Date(now - hoursAgo * 3600000).toISOString();
    const updatedAt = createdAt;
    const id = `demo_${orgId.slice(0, 6)}_${String(i).padStart(3, "0")}`;

    orders.push({
      id, buyerName, buyerPhone, buyerWilaya, product, amount,
      riskLevel, trustScore, riskScore, status, confirmStatus,
      deliveryProvider, createdAt, updatedAt,
    });
  }

  for (const o of orders) {
    state.orders.set(o.id, o);
  }
  state.initialized = true;

  return orders;
}

export function generateDemoOrders(orgId: string): DemoOrderData[] {
  return buildOrders(orgId);
}

export function getDemoOverviewData(orgId: string): OverviewData {
  const orders = buildOrders(orgId);

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= dayStart);
  const weekOrders = orders.filter((o) => new Date(o.createdAt) >= weekStart);
  const highRiskOrders = orders.filter((o) => o.riskLevel === "high");
  const pendingVerifications = orders.filter(
    (o) => o.status === "PRE_SHIPPING_CONFIRM_SENT"
  );
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");

  const stats: OverviewStats = {
    ordersToday: todayOrders.length,
    ordersThisWeek: weekOrders.length,
    revenueToday: todayOrders.reduce((s, o) => s + o.amount, 0),
    revenueThisWeek: weekOrders.reduce((s, o) => s + o.amount, 0),
    atRiskOrders: highRiskOrders.length,
    pendingVerifications: pendingVerifications.length,
    ugcReceived: orders.filter((o) => o.status === "UGC_RECEIVED" || o.status === "UGC_REQUESTED").length,
    deliveredRate: orders.length > 0 ? Math.round((deliveredOrders.length / orders.length) * 100) : 0,
  };

  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const liveOrders: LiveOrder[] = sorted.slice(0, 8).map((o) => ({
    id: o.id,
    buyerName: o.buyerName,
    buyerPhone: o.buyerPhone,
    amount: o.amount,
    product: o.product,
    status: o.status,
    riskLevel: o.riskLevel,
    trustScore: o.trustScore,
    createdAt: o.createdAt,
  }));

  const riskAlerts: RiskAlert[] = highRiskOrders.slice(0, 5).map((o) => ({
    id: `alert_${o.id}`,
    buyerName: o.buyerName,
    buyerPhone: o.buyerPhone,
    amount: o.amount,
    riskLevel: o.riskLevel,
    trustScore: o.trustScore,
    signal: o.trustScore < 30 ? "first-time-order" : "high-risk-score",
    orderId: o.id,
  }));

  return { stats, liveOrders, riskAlerts, ugcOpportunities: [] };
}

export function getDemoRevenueAtRisk(orgId: string): number {
  const orders = buildOrders(orgId);
  const highRiskTotal = orders
    .filter((o) => o.riskLevel === "high")
    .reduce((s, o) => s + o.amount, 0);
  return Math.round(highRiskTotal * 0.3);
}

export function getDemoNeedsConfirmCount(orgId: string): number {
  const orders = buildOrders(orgId);
  return orders.filter(
    (o) => o.status === "CREATED" && o.riskLevel === "high"
  ).length;
}

export function getDemoConfirmationQueue(orgId: string): ConfirmationQueue {
  const orders = buildOrders(orgId);

  const filtered = orders.filter((o) => {
    if (o.confirmStatus === "pending_confirmation" || o.confirmStatus === "contacted") return true;
    if (o.status === "CREATED" && (o.riskLevel === "high" || o.riskLevel === "medium")) return true;
    return false;
  });

  const sorted = [...filtered].sort((a, b) => {
    const riskOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const aVal = riskOrder[a.riskLevel] ?? 0;
    const bVal = riskOrder[b.riskLevel] ?? 0;
    if (bVal !== aVal) return bVal - aVal;
    if (a.trustScore !== b.trustScore) return a.trustScore - b.trustScore;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const items: ConfirmationQueueItem[] = sorted.map((o) => ({
    orderId: o.id,
    buyerName: o.buyerName,
    buyerPhone: o.buyerPhone,
    amount: o.amount,
    product: o.product,
    riskLevel: o.riskLevel,
    trustScore: o.trustScore,
    orderStatus: o.status,
    confirmStatus: o.confirmStatus,
    lastAttemptAt: null,
    lastAttemptOutcome: null,
    createdAt: o.createdAt,
  }));

  return {
    items,
    total: items.length,
    pendingCount: items.filter((i) => i.confirmStatus === "pending_confirmation").length,
    contactedCount: items.filter((i) => i.confirmStatus === "contacted").length,
  };
}

export function getDemoOrdersPageData(orgId: string): OrdersPageData {
  const orders = buildOrders(orgId);

  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const tableItems: OrderTableItem[] = sorted.map((o) => ({
    id: o.id,
    customer: { name: o.buyerName, phone: o.buyerPhone, wilaya: o.buyerWilaya },
    product: o.product,
    amount: o.amount,
    status: o.status,
    riskLevel: o.riskLevel,
    trustScore: o.trustScore,
    paymentStatus: paymentFromStatus(o.status),
    deliveryState: deliveryFromStatus(o.status),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }));

  const now = new Date();
  const today = tableItems.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const atRisk = tableItems.filter((o) => o.riskLevel === "high" || o.deliveryState === "at_risk").length;
  const totalAmount = tableItems.reduce((s, o) => s + o.amount, 0);
  const delivered = tableItems.filter((o) => o.deliveryState === "delivered").length;

  return {
    stats: {
      total: tableItems.length,
      atRisk,
      pendingToday: today,
      revenueTotal: Math.round(totalAmount * 100) / 100,
      deliveredRate: tableItems.length > 0 ? Math.round((delivered / tableItems.length) * 100) : 0,
    },
    orders: tableItems,
  };
}

export function updateDemoOrderState(
  orgId: string,
  orderId: string,
  action: "confirm" | "unreachable" | "cancel"
): { success: boolean; error?: string } {
  const state = orgStates.get(orgId);
  if (!state) return { success: false, error: "Org not initialized" };

  const order = state.orders.get(orderId);
  if (!order) return { success: false, error: "Order not found" };

  switch (action) {
    case "confirm":
      order.confirmStatus = "confirmed";
      if (order.status === "CREATED") {
        order.status = "BUYER_CONFIRMED";
      }
      order.updatedAt = new Date().toISOString();
      break;
    case "unreachable":
      order.confirmStatus = "unreachable";
      order.updatedAt = new Date().toISOString();
      break;
    case "cancel":
      order.confirmStatus = "cancelled";
      order.status = "INTELLIGENT_CANCEL";
      order.updatedAt = new Date().toISOString();
      break;
  }

  state.orders.set(orderId, order);
  return { success: true };
}

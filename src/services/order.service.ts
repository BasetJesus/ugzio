import { prisma } from "@/lib/db";
import { scoreAndPersist } from "@/services/risk.service";
import { schedulePsychologicalSequence, schedulePreDeliveryConfirm } from "@/lib/zioconfirm/service";
import { canTransition } from "@/lib/zioconfirm/state-machine";
import { emitCritical } from "@/lib/events/queues";
import { emit } from "@/lib/events/event-bus";
import { alertSeller, refusedAlert } from "@/lib/alerts/seller";
import { scheduleD3UgcAsk } from "@/lib/zioconfirm/service";
import { FREE_TIER_LIMIT } from "@/lib/constants";
import type { OrderStatus, OrderSummary } from "@/types/order";
import { generateMockRisk } from "@/services/risk.service";

async function ensureActivationEvent(orgId: string, eventType: string) {
  const existing = await prisma.activationEvent.findFirst({
    where: { organizationId: orgId, eventType },
  });
  if (!existing) {
    await prisma.activationEvent.create({
      data: { organizationId: orgId, eventType },
    });
  }
}

export async function listOrders(orgId: string): Promise<OrderSummary[]> {
  const orders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return orders.map((o) => ({
    id: o.id,
    buyerName: o.buyerName,
    buyerPhone: o.buyerPhone,
    buyerWilaya: o.buyerWilaya,
    product: o.product,
    amount: Number(o.amount),
    riskLevel: o.riskLevel as OrderSummary["riskLevel"],
    trustScore: o.trustScore,
    status: o.status as OrderStatus,
    createdAt: o.createdAt.toISOString(),
  }));
}

export async function getOrderDetail(orgId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
    include: {
      conversations: {
        include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
        take: 1,
      },
      ugcItems: true,
      timeline: { orderBy: { scheduledFor: "asc" } },
    },
  });
  return order;
}

export async function checkFreePlanLimit(orgId: string, currentPlan: string, maxOrders: number): Promise<boolean> {
  if (currentPlan !== "free") return false;

  const monthlyCount = await prisma.order.count({
    where: {
      organizationId: orgId,
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });

  return monthlyCount >= Math.min(maxOrders, FREE_TIER_LIMIT);
}

export async function createOrder(orgId: string, data: {
  buyerName: string;
  buyerPhone: string;
  product?: string;
  amount: number;
  buyerWilaya?: string;
}) {
  const order = await prisma.order.create({
    data: {
      organizationId: orgId,
      buyerName: data.buyerName,
      buyerPhone: data.buyerPhone,
      product: data.product ?? null,
      buyerWilaya: data.buyerWilaya ?? null,
      amount: Number(data.amount),
      status: "CREATED",
    },
  });

  try {
    await scoreAndPersist(data.buyerPhone, orgId, data.buyerName, order.id);
  } catch (e) {
    console.error("[order.service] Risk scoring failed:", e);
  }

  try {
    await schedulePsychologicalSequence(order.id);
  } catch (e) {
    console.error("[order.service] Psychological sequence scheduling failed:", e);
  }

  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  try {
    await schedulePreDeliveryConfirm(order.id, estimatedDelivery);
  } catch (e) {
    console.error("[order.service] Pre-delivery confirm scheduling failed:", e);
  }

  await emitCritical("ORDER_CREATED", { orderId: order.id, orgId });

  emit("ORDER_CREATED", {
    orderId: order.id,
    orgId,
    buyerName: data.buyerName,
    buyerPhone: data.buyerPhone,
    amount: Number(data.amount),
    product: data.product ?? null,
  });

  await ensureActivationEvent(orgId, "FIRST_ORDER_CREATED");

  return order;
}

export async function transitionOrderStatus(orgId: string, orderId: string, newStatus: OrderStatus) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
  });
  if (!order) return null;

  const previousStatus = order.status;

  if (!canTransition(previousStatus as never, newStatus as never)) {
    throw new Error(`Invalid transition: ${previousStatus} → ${newStatus}`);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  emit("ORDER_UPDATED", {
    orderId,
    orgId,
    previousStatus,
    newStatus,
    buyerName: order.buyerName,
  });

  if (newStatus === "DELIVERED") {
    await scheduleD3UgcAsk(orderId);
  }

  if (newStatus === "REFUSED") {
    await alertSeller(orgId, refusedAlert(order.buyerName));
  }

  return { id: orderId, status: newStatus };
}

const MOCK_BUYERS = [
  { name: "Amine Letaief", phone: "+216 50 123 401", wilaya: "Tunis" },
  { name: "Sarra Mhenni", phone: "+216 50 123 402", wilaya: "Sfax" },
  { name: "Karim Jaziri", phone: "+216 50 123 403", wilaya: "Sousse" },
  { name: "Mariem Ben Ali", phone: "+216 50 123 404", wilaya: "Nabeul" },
  { name: "Mehdi Khedher", phone: "+216 50 123 405", wilaya: "Monastir" },
  { name: "Nadia Trabelsi", phone: "+216 50 123 406", wilaya: "Gabès" },
  { name: "Hichem Gharbi", phone: "+216 50 123 407", wilaya: "Kairouan" },
  { name: "Ines Bouazizi", phone: "+216 50 123 408", wilaya: "Bizerte" },
  { name: "Mohamed Salah", phone: "+216 50 123 409", wilaya: "Ariana" },
  { name: "Rania Ferchichi", phone: "+216 50 123 410", wilaya: "Ben Arous" },
  { name: "Oussema Khelil", phone: "+216 50 123 411", wilaya: "Tunis" },
  { name: "Fatma Ghannouchi", phone: "+216 50 123 412", wilaya: "Sfax" },
  { name: "Walid Jebali", phone: "+216 50 123 413", wilaya: "Sousse" },
  { name: "Ahlem Boufares", phone: "+216 50 123 414", wilaya: "Nabeul" },
  { name: "Skander Hakim", phone: "+216 50 123 415", wilaya: "Monastir" },
  { name: "Leila Chaouch", phone: "+216 50 123 416", wilaya: "Gabès" },
  { name: "Cyrine Kefi", phone: "+216 50 123 417", wilaya: "Bizerte" },
  { name: "Mohsen Sliti", phone: "+216 50 123 418", wilaya: "Kairouan" },
  { name: "Arij Mami", phone: "+216 50 123 419", wilaya: "Ariana" },
  { name: "Haythem Borgi", phone: "+216 50 123 420", wilaya: "Ben Arous" },
];

const MOCK_PRODUCTS = [
  "Sac à main en cuir", "Montre connectée Pro", "Parfum Oud Royal",
  "Ensemble été femme", "Casque Bluetooth Pro", "Lunettes de soleil design",
  "Tapis de prière luxe", "Crème visage bio", "Smartwatch Sport",
  "Veste en jean", "Robte tunisienne", "Bague argent 925",
  "Sac à dos urbain", "Chaussures running", "Théière traditionnelle",
];

const ALL_STATUSES: OrderStatus[] = [
  "CREATED", "PRE_SHIPPING_CONFIRM_SENT", "BUYER_CONFIRMED",
  "SHIPPED", "DELIVERED", "UGC_REQUESTED", "UGC_RECEIVED",
  "INTELLIGENT_CANCEL", "PENDING_RESCHEDULE", "REFUSED",
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function randomAmount(): number { return Math.round((Math.random() * 250 + 15) * 1000) / 1000; }

function randomScore(): number { return Math.floor(Math.random() * 100); }

function paymentFromStatus(status: OrderStatus): "pending" | "confirmed" | "failed" | "refunded" {
  if (status === "DELIVERED" || status === "BUYER_CONFIRMED") return "confirmed";
  if (status === "REFUSED" || status === "INTELLIGENT_CANCEL") return "failed";
  if (status === "CREATED" || status === "PRE_SHIPPING_CONFIRM_SENT") return "pending";
  return "confirmed";
}

function deliveryFromStatus(status: OrderStatus): import("@/types/order").DeliveryState {
  switch (status) {
    case "DELIVERED": case "UGC_REQUESTED": case "UGC_RECEIVED": return "delivered";
    case "SHIPPED": return "on_time";
    case "REFUSED": return "returned";
    case "INTELLIGENT_CANCEL": case "PENDING_RESCHEDULE": return "at_risk";
    default: return "delayed";
  }
}

export function getMockOrdersPageData(): import("@/types/order").OrdersPageData {
  const orders: import("@/types/order").OrderTableItem[] = [];
  const now = Date.now();

  for (let i = 0; i < 28; i++) {
    const buyer = pick(MOCK_BUYERS);
    const status = pick(ALL_STATUSES);
    const amount = randomAmount();
    const mockRisk = generateMockRisk({
      amount,
      buyerWilaya: buyer.wilaya,
      status: status,
      isFirstTime: Math.random() > 0.5,
    });
    const createdAt = new Date(now - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000));

    orders.push({
      id: `ord_${Math.random().toString(36).slice(2, 10)}`,
      customer: { name: buyer.name, phone: buyer.phone, wilaya: buyer.wilaya },
      product: pick(MOCK_PRODUCTS),
      amount,
      status,
      riskLevel: mockRisk.riskLevel,
      trustScore: mockRisk.trustScore,
      paymentStatus: paymentFromStatus(status),
      deliveryState: deliveryFromStatus(status),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
  }

  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const atRisk = orders.filter((o) => o.riskLevel === "high" || o.deliveryState === "at_risk").length;
  const today = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const totalAmount = orders.reduce((s, o) => s + o.amount, 0);
  const delivered = orders.filter((o) => o.deliveryState === "delivered").length;

  return {
    stats: {
      total: orders.length,
      atRisk,
      pendingToday: today,
      revenueTotal: Math.round(totalAmount * 100) / 100,
      deliveredRate: orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0,
    },
    orders,
  };
}

export async function getOrdersCountByRisk(orgId: string): Promise<{ total: number; highRisk: number; todayOrders: number }> {
  const { getOrderCountsByRisk } = await import("@/services/risk.service");
  return getOrderCountsByRisk(orgId);
}

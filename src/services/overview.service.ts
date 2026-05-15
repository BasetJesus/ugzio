import { prisma } from "@/lib/db";
import { getHighRiskAlerts } from "@/services/risk.service";

export interface OverviewStats {
  ordersToday: number;
  ordersThisWeek: number;
  revenueToday: number;
  revenueThisWeek: number;
  atRiskOrders: number;
  pendingVerifications: number;
  ugcReceived: number;
  deliveredRate: number;
}

export interface LiveOrder {
  id: string;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  product: string | null;
  status: string;
  riskLevel: string;
  trustScore: number;
  createdAt: string;
}

export interface RiskAlert {
  id: string;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  riskLevel: string;
  trustScore: number;
  signal: string;
  orderId: string;
}

export interface UGCOpportunity {
  id: string;
  buyerName: string;
  product: string | null;
  daysSinceDelivery: number;
  estimatedValue: string;
  orderId: string;
}

export interface OverviewData {
  stats: OverviewStats;
  liveOrders: LiveOrder[];
  riskAlerts: RiskAlert[];
  ugcOpportunities: UGCOpportunity[];
}

export async function getOverviewData(orgId: string): Promise<OverviewData> {
  try {
    const dayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [stats, liveOrders, riskAlerts, ugcOpportunities] = await Promise.all([
      loadStats(orgId, dayStart, weekStart),
      loadLiveOrders(orgId),
      getHighRiskAlerts(orgId, 5),
      loadUGCOpportunities(orgId),
    ]);

    return { stats, liveOrders, riskAlerts, ugcOpportunities };
  } catch {
    return { stats: { ordersToday: 0, ordersThisWeek: 0, revenueToday: 0, revenueThisWeek: 0, atRiskOrders: 0, pendingVerifications: 0, ugcReceived: 0, deliveredRate: 0 }, liveOrders: [], riskAlerts: [], ugcOpportunities: [] };
  }
}

async function loadStats(orgId: string, dayStart: Date, weekStart: Date): Promise<OverviewStats> {
  try {
    const [
      ordersToday,
      ordersThisWeek,
      revenueTodayAgg,
      revenueThisWeekAgg,
      atRiskOrders,
      pendingVerifications,
      ugcReceived,
      totalOrders,
      deliveredOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, createdAt: { gte: dayStart } } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, createdAt: { gte: weekStart } } }),
      prisma.order.aggregate({ where: { organizationId: orgId, deletedAt: null, createdAt: { gte: dayStart } }, _sum: { amount: true } }),
      prisma.order.aggregate({ where: { organizationId: orgId, deletedAt: null, createdAt: { gte: weekStart } }, _sum: { amount: true } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, riskLevel: "high" } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "PRE_SHIPPING_CONFIRM_SENT" } }),
      prisma.ugcItem.count({ where: { order: { organizationId: orgId }, status: "received" } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "DELIVERED" } }),
    ]);

    return {
      ordersToday,
      ordersThisWeek,
      revenueToday: Number(revenueTodayAgg._sum.amount ?? 0),
      revenueThisWeek: Number(revenueThisWeekAgg._sum.amount ?? 0),
      atRiskOrders,
      pendingVerifications,
      ugcReceived,
      deliveredRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0,
    };
  } catch {
    return {
      ordersToday: 0,
      ordersThisWeek: 0,
      revenueToday: 0,
      revenueThisWeek: 0,
      atRiskOrders: 0,
      pendingVerifications: 0,
      ugcReceived: 0,
      deliveredRate: 0,
    };
  }
}

async function loadLiveOrders(orgId: string): Promise<LiveOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    return orders.map((o) => ({
      id: o.id,
      buyerName: o.buyerName,
      buyerPhone: o.buyerPhone,
      amount: Number(o.amount),
      product: o.product,
      status: o.status,
      riskLevel: o.riskLevel,
      trustScore: o.trustScore,
      createdAt: o.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

async function loadUGCOpportunities(orgId: string): Promise<UGCOpportunity[]> {
  try {
    const items = await prisma.ugcItem.findMany({
      where: { order: { organizationId: orgId }, status: "received" },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { order: { select: { buyerName: true, product: true, id: true } } },
    });
    return items.map((item) => ({
      id: `ugc_${item.id}`,
      buyerName: item.order.buyerName,
      product: item.order.product,
      daysSinceDelivery: Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 86400000),
      estimatedValue: "medium",
      orderId: item.order.id,
    }));
  } catch {
    return [];
  }
}



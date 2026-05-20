import { prisma } from "@/lib/db";
import { getHighRiskAlerts } from "@/services/risk.service";

export interface LoopCompletionStats {
  totalCompleted: number
  successfulCompletions: number
  failedCompletions: number
  completionRate: number
  learningSignals: number
}

export interface OverviewStats {
  ordersToday: number;
  ordersThisWeek: number;
  revenueToday: number;
  revenueThisWeek: number;
  atRiskOrders: number;
  pendingVerifications: number;
  ugcReceived: number;
  deliveredRate: number;
  loopCompletion?: LoopCompletionStats;
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

export async function getLoopCompletionStats(orgId: string): Promise<LoopCompletionStats> {
  try {
    const terminalStatuses = ["UGC_RECEIVED", "REFUSED", "INTELLIGENT_CANCEL"]
    const [completedOrders, aiEvaluations, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where: { organizationId: orgId, deletedAt: null, status: { in: terminalStatuses } },
        select: { status: true },
      }),
      prisma.aIEvaluation.count({ where: { organizationId: orgId } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
    ])

    const successfulCompletions = completedOrders.filter(o => o.status === "UGC_RECEIVED").length
    const failedCompletions = completedOrders.filter(o => o.status === "REFUSED" || o.status === "INTELLIGENT_CANCEL").length

    return {
      totalCompleted: completedOrders.length,
      successfulCompletions,
      failedCompletions,
      completionRate: totalOrders > 0 ? Math.round((completedOrders.length / totalOrders) * 100) : 0,
      learningSignals: aiEvaluations,
    }
  } catch {
    return { totalCompleted: 0, successfulCompletions: 0, failedCompletions: 0, completionRate: 0, learningSignals: 0 }
  }
}

export async function getOverviewData(orgId: string): Promise<OverviewData> {
  try {
    const dayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [stats, loopCompletion, liveOrders, riskAlerts, ugcOpportunities] = await Promise.all([
      loadStats(orgId, dayStart, weekStart),
      getLoopCompletionStats(orgId),
      loadLiveOrders(orgId),
      getHighRiskAlerts(orgId, 5),
      loadUGCOpportunities(orgId),
    ]);

    stats.loopCompletion = loopCompletion

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

export interface CaptionSummary {
  id: string
  imageUrl: string
  text: string
  engagement: string
  trend: "up" | "down"
  change: number
}

export interface ChannelSummary {
  id: string
  platform: "instagram" | "whatsapp" | "tiktok"
  name: string
  value: string
  pct: number
  change: number
}

export interface OverviewGrowthSection {
  ugcItems: {
    id: string
    imageUrl: string
    isNew: boolean
    creator: string
    platform: string
    uploadedAt: string
  }[]
  topCaptions: CaptionSummary[]
  channelPerformance: ChannelSummary[]
}

export async function getOverviewGrowthSection(orgId: string): Promise<OverviewGrowthSection> {
  try {
    const [ugcItems, ugcStats, flowStats] = await Promise.all([
      prisma.ugcItem.findMany({
        where: { order: { organizationId: orgId } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { order: { select: { buyerName: true, product: true } } },
      }),
      prisma.ugcItem.groupBy({
        by: ["status"],
        where: { order: { organizationId: orgId } },
        _count: { id: true },
      }),
      prisma.zioFlowPost.groupBy({
        by: ["platform", "status"],
        where: { organizationId: orgId },
        _count: { id: true },
      }),
    ])

    const now = Date.now()
    const ugcItemsFormatted = ugcItems.map((item) => {
      const diffMs = now - new Date(item.createdAt).getTime()
      const diffHrs = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      const uploadedAt = diffHrs < 1 ? "just now" : diffHrs < 24 ? `${diffHrs}h ago` : `${diffDays}d ago`
      return {
        id: item.id,
        imageUrl: item.mediaUrl,
        isNew: item.status === "received",
        creator: item.order.buyerName,
        platform: item.mediaType === "video" ? "TikTok" : "Instagram",
        uploadedAt,
      }
    })

    const totalPublished = flowStats.filter((s) => s.status === "published").reduce((sum, s) => sum + s._count.id, 0)
    const channelMap: Record<string, { count: number; platform: string }> = {}
    for (const s of flowStats) {
      if (s.status === "published") {
        if (!channelMap[s.platform]) channelMap[s.platform] = { count: 0, platform: s.platform }
        channelMap[s.platform].count += s._count.id
      }
    }
    const channelLabels: Record<string, string> = { instagram: "Instagram", whatsapp: "WhatsApp", tiktok: "TikTok" }
    const channelPerformance: ChannelSummary[] = Object.entries(channelMap).map(([key, val]) => ({
      id: key,
      platform: key as "instagram" | "whatsapp" | "tiktok",
      name: channelLabels[key] ?? key,
      value: val.count >= 1000 ? `${(val.count / 1000).toFixed(1)}K` : `${val.count}`,
      pct: totalPublished > 0 ? Math.round((val.count / totalPublished) * 100) : 0,
      change: 0,
    }))

    if (channelPerformance.length === 0) {
      channelPerformance.push(
        { id: "ig", platform: "instagram", name: "Instagram", value: "0", pct: 0, change: 0 },
        { id: "wa", platform: "whatsapp", name: "WhatsApp", value: "0", pct: 0, change: 0 },
        { id: "tt", platform: "tiktok", name: "TikTok", value: "0", pct: 0, change: 0 },
      )
    }

    const topCaptions = ugcItems.filter((i) => i.status === "approved").slice(0, 3).map((item) => ({
      id: item.id,
      imageUrl: item.mediaUrl,
      text: item.order.product
        ? `Check out ${item.order.buyerName}'s ${item.order.product} — amazing quality! ✨`
        : `${item.order.buyerName} shared their experience with us! 💬`,
      engagement: `${Math.floor(Math.random() * 50) + 1}K`,
      trend: (Math.random() > 0.3 ? "up" : "down") as "up" | "down",
      change: parseFloat((Math.random() * 30 + 5).toFixed(1)),
    }))

    return { ugcItems: ugcItemsFormatted, topCaptions, channelPerformance }
  } catch {
    return { ugcItems: [], topCaptions: [], channelPerformance: [] }
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



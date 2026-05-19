import { prisma } from "@/lib/db";
import { getAggregateRiskStats } from "@/services/risk.service";

export interface ShieldPageData {
  averageScore: number;
  highRiskCount: number;
  todayOrders: number;
  allOrders: Array<{
    id: string;
    buyerName: string;
    buyerPhone: string;
    riskLevel: string;
    trustScore: number;
  }>;
}

export async function getShieldData(orgId: string): Promise<ShieldPageData> {
  try {
    const [riskStats, allOrders] = await Promise.all([
      getAggregateRiskStats(orgId),
      prisma.order.findMany({
        where: { organizationId: orgId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, buyerName: true, buyerPhone: true, riskLevel: true, trustScore: true },
      }),
    ]);

    return {
      averageScore: riskStats.averageScore,
      highRiskCount: riskStats.highRiskCount,
      todayOrders: riskStats.todayOrders,
      allOrders,
    };
  } catch {
    return { averageScore: 0, highRiskCount: 0, todayOrders: 0, allOrders: [] };
  }
}

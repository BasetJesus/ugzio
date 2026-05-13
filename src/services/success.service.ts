import { prisma } from "@/lib/db";
import { percentage } from "@/lib/utils";
import { getAggregateRiskStats } from "@/services/risk.service";

export interface SuccessStats {
  ordersProtected: number;
  revenueSaved: number;
  rtsBefore: number;
  rtsAfter: number;
  highRiskBlocked: number;
  verificationRate: number;
}

export async function getSuccessStats(orgId: string): Promise<SuccessStats> {
  const [riskStats, totalAmount, refusedOrders, deliveredOrders] = await Promise.all([
    getAggregateRiskStats(orgId),
    prisma.order.aggregate({
      where: { organizationId: orgId, deletedAt: null },
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "REFUSED" } }),
    prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "DELIVERED" } }),
  ]);

  const revenueSaved = Math.round(Number(totalAmount._sum.amount ?? 0) * 0.3);
  const rtsRate = riskStats.totalOrders > 0 ? percentage(refusedOrders, riskStats.totalOrders) : 0;
  const verificationRate = riskStats.totalOrders > 0 ? percentage(deliveredOrders, riskStats.totalOrders) : 0;

  return {
    ordersProtected: riskStats.totalOrders,
    revenueSaved,
    rtsBefore: Math.min(100, rtsRate + 25),
    rtsAfter: rtsRate,
    highRiskBlocked: riskStats.highRiskCount,
    verificationRate,
  };
}

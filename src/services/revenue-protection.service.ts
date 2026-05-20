import { prisma } from "@/lib/db";
import { getProviderRtsCost } from "@/services/delivery-provider.service";
import { getTodayOutcomeStats, OutcomeStats } from "@/services/operation-outcome.service";

const DEFAULT_RTS_COST = 15.0;

export interface RiskOrderMetrics {
  orderId: string;
  buyerName: string;
  amount: number;
  riskLevel: string;
  trustScore: number;
  failureProbability: number;
  estimatedRtsLoss: number;
  estimatedRevenueAtRisk: number;
  deliveryProviderId: string | null;
}

export interface RevenueProtectionStats {
  totalRevenueAtRisk: number;
  estimatedPreventableLoss: number;
  ordersAtRisk: number;
  highRiskOrders: number;
  avgRiskScore: number;
  todayStats: OutcomeStats;
}

export interface ProtectedRevenueBreakdown {
  orderId: string;
  action: string;
  orderAmount: number;
  riskLevelBefore: string | null;
  estimatedSaved: number;
  estimatedPrevented: number;
  timestamp: string;
}

export function calculateFailureProbability(riskLevel: string, trustScore: number): number {
  let base: number;

  switch (riskLevel) {
    case "high":
      base = 0.45;
      break;
    case "medium":
      base = 0.2;
      break;
    case "low":
    default:
      base = 0.05;
  }

  const trustModifier = (100 - trustScore) / 100;
  const adjusted = base + (trustModifier * 0.3);

  return Math.min(Math.max(adjusted, 0.02), 0.9);
}

export function calculateEstimatedRtsLoss(
  orderAmount: number,
  riskLevel: string,
  trustScore: number,
  rtsCost: number = DEFAULT_RTS_COST
): { estimatedRtsLoss: number; estimatedRevenueAtRisk: number; failureProbability: number } {
  const failureProbability = calculateFailureProbability(riskLevel, trustScore);

  const estimatedRtsLoss = rtsCost * failureProbability;

  const estimatedRevenueAtRisk = orderAmount * failureProbability;

  return {
    failureProbability: Math.round(failureProbability * 100),
    estimatedRtsLoss: Math.round(estimatedRtsLoss * 100) / 100,
    estimatedRevenueAtRisk: Math.round(estimatedRevenueAtRisk * 100) / 100,
  };
}

export function calculateActionOutcome(
  action: "confirm" | "cancel" | "unreachable" | "suspicious" | "retry",
  orderAmount: number,
  riskLevel: string,
  trustScore: number,
  rtsCost: number = DEFAULT_RTS_COST
): { revenueSaved: number; lossPrevented: number } {
  const { estimatedRtsLoss, estimatedRevenueAtRisk } = calculateEstimatedRtsLoss(
    orderAmount,
    riskLevel,
    trustScore,
    rtsCost
  );

  switch (action) {
    case "confirm":
      return {
        revenueSaved: estimatedRevenueAtRisk,
        lossPrevented: estimatedRtsLoss,
      };

    case "cancel":
      return {
        revenueSaved: 0,
        lossPrevented: estimatedRtsLoss,
      };

    case "unreachable":
    case "suspicious":
      return {
        revenueSaved: 0,
        lossPrevented: estimatedRtsLoss * 0.5,
      };

    case "retry":
    default:
      return {
        revenueSaved: 0,
        lossPrevented: 0,
      };
  }
}

export async function getRiskOrderMetrics(
  orgId: string,
  orderId: string
): Promise<RiskOrderMetrics | null> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
      select: {
        id: true,
        buyerName: true,
        amount: true,
        riskLevel: true,
        trustScore: true,
        deliveryProviderId: true,
      },
    });

    if (!order) return null;

    const rtsCost = await getProviderRtsCost(orgId, order.deliveryProviderId ?? undefined);
    const metrics = calculateEstimatedRtsLoss(
      Number(order.amount),
      order.riskLevel,
      order.trustScore,
      rtsCost
    );

    return {
      orderId: order.id,
      buyerName: order.buyerName,
      amount: Number(order.amount),
      riskLevel: order.riskLevel,
      trustScore: order.trustScore,
      failureProbability: metrics.failureProbability,
      estimatedRtsLoss: metrics.estimatedRtsLoss,
      estimatedRevenueAtRisk: metrics.estimatedRevenueAtRisk,
      deliveryProviderId: order.deliveryProviderId,
    };
  } catch {
    return null;
  }
}

export async function getRevenueProtectionStats(orgId: string): Promise<RevenueProtectionStats> {
  try {
    const [todayStats, atRiskOrders] = await Promise.all([
      getTodayOutcomeStats(orgId),
      prisma.order.findMany({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: {
            in: ["CREATED", "PRE_SHIPPING_CONFIRM_SENT"],
          },
        },
        select: {
          id: true,
          amount: true,
          riskLevel: true,
          trustScore: true,
          deliveryProviderId: true,
        },
      }),
    ]);

    let totalRevenueAtRisk = 0;
    let estimatedPreventableLoss = 0;
    let totalTrustScore = 0;
    let highRiskCount = 0;

    for (const order of atRiskOrders) {
      const rtsCost = await getProviderRtsCost(orgId, order.deliveryProviderId ?? undefined);
      const metrics = calculateEstimatedRtsLoss(
        Number(order.amount),
        order.riskLevel,
        order.trustScore,
        rtsCost
      );

      totalRevenueAtRisk += metrics.estimatedRevenueAtRisk;
      estimatedPreventableLoss += metrics.estimatedRtsLoss;
      totalTrustScore += order.trustScore;

      if (order.riskLevel === "high") {
        highRiskCount++;
      }
    }

    return {
      totalRevenueAtRisk: Math.round(totalRevenueAtRisk * 100) / 100,
      estimatedPreventableLoss: Math.round(estimatedPreventableLoss * 100) / 100,
      ordersAtRisk: atRiskOrders.length,
      highRiskOrders: highRiskCount,
      avgRiskScore: atRiskOrders.length > 0 ? Math.round(totalTrustScore / atRiskOrders.length) : 50,
      todayStats,
    };
  } catch {
    return {
      totalRevenueAtRisk: 0,
      estimatedPreventableLoss: 0,
      ordersAtRisk: 0,
      highRiskOrders: 0,
      avgRiskScore: 50,
      todayStats: {
        totalActions: 0,
        revenueSaved: 0,
        lossPrevented: 0,
        confirmations: 0,
        cancellations: 0,
        unreachable: 0,
        confirmationRate: 0,
      },
    };
  }
}

export async function getTodayProtectedRevenue(orgId: string): Promise<ProtectedRevenueBreakdown[]> {
  try {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    const outcomes = await prisma.operationOutcome.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: dayStart },
      },
      orderBy: { createdAt: "desc" },
    });

    return outcomes.map((o) => ({
      orderId: o.orderId,
      action: o.actionTaken,
      orderAmount: Number(o.orderAmount),
      riskLevelBefore: o.riskLevelBefore,
      estimatedSaved: Number(o.estimatedRevenueSaved),
      estimatedPrevented: Number(o.estimatedLossPrevented),
      timestamp: o.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getRevenueAtRisk(orgId: string): Promise<number> {
  try {
    const stats = await getRevenueProtectionStats(orgId);
    return stats.totalRevenueAtRisk;
  } catch {
    return 0;
  }
}

export function getPreventableLossPercent(totalAtRisk: number, protectedToday: number): number {
  if (totalAtRisk + protectedToday <= 0) return 0;
  return Math.round((protectedToday / (totalAtRisk + protectedToday)) * 100);
}



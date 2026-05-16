import { prisma } from "@/lib/db";
import { computeScore, computeAndAlert } from "@/lib/zioshield/scoring";
import { addToBlacklist, removeFromBlacklist } from "@/lib/zioshield/blacklist";
import { determineRiskLevel } from "@/lib/risk/config";
import { emit } from "@/lib/events/event-bus";
import { EventType } from "@/lib/events/taxonomy";
import type { ScoreResult, RiskDashboardStats, RecentRiskOrder, BlacklistEntry, RiskSignal, RiskExplanation, RiskAlertItem, RiskAggregateStats } from "@/types/risk";
import type { RiskLevel } from "@/types/order";

async function ensureActivationEvent(orgId: string, eventType: string) {
  try {
    const existing = await prisma.activationEvent.findFirst({
      where: { organizationId: orgId, eventType },
    });
    if (!existing) {
      await prisma.activationEvent.create({
        data: { organizationId: orgId, eventType },
      });
    }
  } catch {
    // non-critical, silently ignore
  }
}

// ─── Re-exports (gateway through this service) ───
export { determineRiskLevel } from "@/lib/risk/config";

export async function scorePhone(orgId: string, phone: string, excludeOrderId?: string): Promise<ScoreResult> {
  try {
    return await computeScore(phone, orgId, excludeOrderId);
  } catch {
    return { score: 50, riskLevel: "medium", signals: [] };
  }
}

export async function scoreAndPersist(
  phone: string,
  orgId: string,
  buyerName: string,
  orderId: string,
): Promise<ScoreResult> {
  try {
    const result = await computeAndAlert(phone, orgId, buyerName, orderId);

    emit(EventType.RISK_SCORED, {
      orderId,
      orgId,
      riskScore: result.score,
      riskLevel: result.riskLevel,
      trustScore: 100 - result.score,
      signals: result.signals,
    });

    return result;
  } catch {
    return { score: 50, riskLevel: "medium", signals: [] };
  }
}

// ─── Core Risk Intelligence ───

export function calculateRiskScore(order: {
  amount: number;
  trustScore: number;
  riskLevel: string;
  status: string;
  buyerWilaya?: string | null;
}): { riskScore: number; trustScore: number; riskLevel: RiskLevel } {
  let score = 100 - order.trustScore;
  if (order.amount > 150) score += 10;
  if (order.status === "PENDING_RESCHEDULE") score += 15;
  if (order.status === "REFUSED" || order.status === "INTELLIGENT_CANCEL") score += 20;
  score = Math.max(0, Math.min(100, score));
  return { riskScore: score, trustScore: 100 - score, riskLevel: determineRiskLevel(score) };
}

export function generateRiskSignals(order: {
  amount: number;
  status: string;
  buyerWilaya?: string | null;
  riskLevel: string;
  trustScore: number;
}): RiskSignal[] {
  const signals: RiskSignal[] = [];

  if (order.trustScore < 40 && order.riskLevel !== "low") {
    signals.push({ type: "first-time-order", label: "First-time buyer", weight: 10, detected: true });
  }

  if (order.amount > 150) {
    signals.push({ type: "high-amount", label: "High amount detected", weight: 15, detected: true });
  }

  const RISKY_WILAYAS = ["Kairouan", "Gabès", "Kasserine"];
  if (order.buyerWilaya && RISKY_WILAYAS.includes(order.buyerWilaya)) {
    signals.push({ type: "unusual-region", label: "Unusual region pattern", weight: 10, detected: true });
  }

  if (order.status === "PENDING_RESCHEDULE") {
    signals.push({ type: "hesitation", label: "Hesitation detected", weight: 15, detected: true });
  }

  if (order.status === "REFUSED") {
    signals.push({ type: "payment-irregularity", label: "Payment irregularity", weight: 20, detected: true });
  }

  if (order.status === "INTELLIGENT_CANCEL") {
    signals.push({ type: "prior-failures", label: "Prior failed orders", weight: 10, detected: true });
  }

  signals.push({ type: "device-mismatch", label: "Device mismatch detected", weight: 20, detected: false });

  return signals;
}

export function evaluateTrustScore(riskScore: number): number {
  return Math.max(0, Math.min(100, 100 - riskScore));
}

export function flagOrder(orgId: string, orderId: string): Promise<void> {
  return addToBlacklist(orgId, orderId);
}

export function explainRiskReason(riskLevel: RiskLevel, signals: RiskSignal[]): RiskExplanation {
  const activeSignals = signals.filter((s) => s.detected);

  const summaries: Record<string, string> = {
    low: "This order appears low risk. No significant red flags detected.",
    medium: "This order has some risk indicators worth monitoring.",
    high: "This order has multiple risk signals requiring immediate attention.",
  };

  const recommendations: Record<string, string> = {
    low: "Proceed as normal.",
    medium: "Monitor order progress and verify buyer details.",
    high: "Contact buyer before shipping. Consider requiring payment confirmation.",
  };

  return {
    level: riskLevel,
    summary: summaries[riskLevel] ?? "",
    signals: activeSignals,
    recommendation: recommendations[riskLevel] ?? "",
  };
}

// ─── Aggregation / Query Methods ───

export async function getHighRiskAlerts(orgId: string, limit = 10): Promise<RiskAlertItem[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { organizationId: orgId, deletedAt: null, riskLevel: "high" },
      orderBy: { trustScore: "asc" },
      take: limit,
    });

    return orders.map((o) => {
      const signals = generateRiskSignals({
        amount: Number(o.amount),
        status: o.status,
        buyerWilaya: o.buyerWilaya,
        riskLevel: o.riskLevel,
        trustScore: o.trustScore,
      });
      const primarySignal = signals.find((s) => s.detected)?.type ?? "first-time-order";

      return {
        id: `alert_${o.id}`,
        buyerName: o.buyerName,
        buyerPhone: o.buyerPhone,
        amount: Number(o.amount),
        riskLevel: o.riskLevel as RiskLevel,
        trustScore: o.trustScore,
        signal: primarySignal,
        orderId: o.id,
      };
    });
  } catch {
    return [];
  }
}

export async function getAggregateRiskStats(orgId: string): Promise<RiskAggregateStats> {
  try {
    const dayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const [totalOrders, highRiskCount, averageScoreAgg, todayOrders, revenueAtRisk] = await Promise.all([
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, riskLevel: "high" } }),
      prisma.order.aggregate({
        where: { organizationId: orgId, deletedAt: null },
        _avg: { trustScore: true },
      }),
      prisma.order.count({
        where: { organizationId: orgId, deletedAt: null, createdAt: { gte: dayStart } },
      }),
      prisma.order.aggregate({
        where: { organizationId: orgId, deletedAt: null, riskLevel: "high" },
        _sum: { amount: true },
      }),
    ]);

    return {
      averageScore: totalOrders > 0 ? (averageScoreAgg._avg.trustScore ?? 50) : 50,
      highRiskCount,
      todayOrders,
      totalOrders,
      revenueAtRisk: Math.round(Number(revenueAtRisk._sum.amount ?? 0)),
    };
  } catch {
    return { averageScore: 50, highRiskCount: 0, todayOrders: 0, totalOrders: 0, revenueAtRisk: 0 };
  }
}

export async function getOrderCountsByRisk(orgId: string): Promise<{ total: number; highRisk: number; todayOrders: number }> {
  try {
    const dayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const [total, highRisk, todayOrders] = await Promise.all([
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, riskLevel: "high" } }),
      prisma.order.count({
        where: { organizationId: orgId, deletedAt: null, createdAt: { gte: dayStart } },
      }),
    ]);

    return { total, highRisk, todayOrders };
  } catch {
    return { total: 0, highRisk: 0, todayOrders: 0 };
  }
}

export async function getRevenueAtRisk(orgId: string): Promise<number> {
  try {
    const result = await prisma.order.aggregate({
      where: { organizationId: orgId, deletedAt: null, riskLevel: "high" },
      _sum: { amount: true },
    });
    return Math.round(Number(result._sum.amount ?? 0) * 0.3);
  } catch {
    return 0;
  }
}

export async function getNeedsConfirmCount(orgId: string): Promise<number> {
  try {
    return await prisma.order.count({
      where: { organizationId: orgId, deletedAt: null, status: "CREATED", riskLevel: "high" },
    });
  } catch {
    return 0;
  }
}

export async function getHighRiskCreatedOrders(orgId: string, limit = 5) {
  try {
    const orders = await prisma.order.findMany({
      where: { organizationId: orgId, deletedAt: null, riskLevel: "high", status: "CREATED" },
      orderBy: { trustScore: "asc" },
      take: limit,
      select: { id: true, buyerName: true, buyerPhone: true, amount: true, riskLevel: true, trustScore: true, status: true, product: true, organizationId: true, createdAt: true },
    });

    return orders.map((o) => ({
      id: o.id,
      buyerName: o.buyerName,
      buyerPhone: o.buyerPhone,
      amount: Number(o.amount),
      riskLevel: o.riskLevel,
      trustScore: o.trustScore,
      status: o.status,
      product: o.product,
      organizationId: o.organizationId,
      createdAt: o.createdAt,
    }));
  } catch {
    return [];
  }
}

// ─── Existing Dashboard / Blacklist Methods ───

export async function getRiskDashboard(orgId: string): Promise<RiskDashboardStats> {
  const orders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const todayOrders = orders.filter((o) => o.createdAt >= todayStart);
  const highRiskOrders = orders.filter((o) => o.riskLevel === "high");

  return {
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    todayRevenue: todayOrders.reduce((s, o) => s + Number(o.amount), 0),
    highRiskCount: highRiskOrders.length,
    verificationRate: orders.length > 0
      ? Math.round((orders.filter((o) => o.verificationStatus !== "none").length / orders.length) * 100)
      : 0,
    recentOrders: orders.slice(0, 10).map((o) => ({
      id: o.id,
      buyerName: o.buyerName,
      buyerPhone: o.buyerPhone,
      amount: Number(o.amount),
      riskLevel: o.riskLevel as RecentRiskOrder["riskLevel"],
      trustScore: o.trustScore,
      verificationStatus: o.verificationStatus,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}

export async function getBlacklistedPhones(orgId: string): Promise<BlacklistEntry[]> {
  const entries = await prisma.order.findMany({
    where: { organizationId: orgId, riskLevel: "high", deletedAt: null },
    select: { buyerPhone: true, buyerName: true, createdAt: true },
    distinct: ["buyerPhone"],
    orderBy: { createdAt: "desc" },
  });

  return entries.map((e) => ({
    buyerPhone: e.buyerPhone,
    buyerName: e.buyerName,
    createdAt: e.createdAt,
  }));
}

export async function blacklistPhone(orgId: string, phone: string) {
  await addToBlacklist(orgId, phone);
  await ensureActivationEvent(orgId, "FIRST_HIGH_RISK_BLOCKED");

  const flaggedOrder = await prisma.order.findFirst({
    where: { organizationId: orgId, buyerPhone: phone, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, buyerName: true, trustScore: true },
  });

  if (flaggedOrder) {
    emit(EventType.RISK_ORDER_FLAGGED, {
      orderId: flaggedOrder.id,
      orgId,
      buyerPhone: phone,
      buyerName: flaggedOrder.buyerName,
      riskScore: 100 - flaggedOrder.trustScore,
    });
  }
}

export async function unblacklistPhone(orgId: string, phone: string) {
  await removeFromBlacklist(orgId, phone);
}



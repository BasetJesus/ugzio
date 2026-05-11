import { prisma } from "@/lib/db";

interface ScoreResult {
  score: number;
  riskLevel: "low" | "medium" | "high";
  signals: string[];
}

export async function computeScore(
  phone: string,
  orgId: string,
  excludeOrderId?: string,
): Promise<ScoreResult> {
  const signals: string[] = [];

  // 1. Order history
  const orderCount = await prisma.order.count({
    where: { organizationId: orgId, buyerPhone: phone, id: { not: excludeOrderId }, deletedAt: null },
  });
  const hasHistory = orderCount > 0;

  // 2. Failed deliveries
  const failedCount = await prisma.order.count({
    where: { organizationId: orgId, buyerPhone: phone, status: "failed", deletedAt: null },
  });

  // 3. Blacklist check
  const blacklistEntry = await prisma.order.findFirst({
    where: { organizationId: orgId, buyerPhone: phone, riskLevel: "high" },
  });
  const isBlacklisted = blacklistEntry !== null;

  // 4. Anonymized network score (placeholder — Python ML in Sprint 4)
  const identity = await prisma.buyerIdentity.findFirst({
    where: { anonymizedId: phone }, // will use computeAnonymizedId in production
  });
  const networkScore = identity?.networkMlScore ?? 50;

  // Compute score
  let score = 60; // default medium

  if (isBlacklisted) {
    score = 0;
    signals.push("blacklisted");
  }

  if (hasHistory) score += 15;
  if (failedCount > 2) { score -= 20; signals.push("high-failure-rate"); }
  if (failedCount > 0 && failedCount <= 2) { score -= 10; signals.push("prior-failures"); }
  if (networkScore < 30) { score -= 15; signals.push("low-network-score"); }
  if (networkScore > 70) { score += 10; signals.push("high-network-score"); }

  score = Math.max(0, Math.min(100, score));

  let riskLevel: "low" | "medium" | "high";
  if (score >= 70) riskLevel = "low";
  else if (score >= 40) riskLevel = "medium";
  else riskLevel = "high";

  return { score, riskLevel, signals };
}

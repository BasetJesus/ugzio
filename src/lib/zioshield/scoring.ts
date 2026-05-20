import { prisma } from "@/lib/db";
import { alertSeller, highRiskAlert } from "@/lib/alerts/seller";
import { checkZioGuard } from "@/services/zioguard.service";

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

interface ScoreResult {
  score: number;
  riskLevel: "low" | "medium" | "high";
  signals: string[];
}

const WEIGHTS = {
  replyDelayMinutes: (delay: number) => (delay > 20 ? 30 : 0),
  changedAddress: (changed: boolean) => (changed ? 20 : 0),
  noConfirmIn6h: (expired: boolean) => (expired ? 35 : 0),
  hesitationMessages: (count: number) => (count > 2 ? 15 : 0),
  firstTimeOrder: (isFirst: boolean) => (isFirst ? 10 : 0),
};

export async function computeScore(
  phone: string,
  orgId: string,
  excludeOrderId?: string,
): Promise<ScoreResult> {
  const signals: string[] = [];
  let score = 50;

  const previousOrders = await prisma.order.findMany({
    where: { organizationId: orgId, buyerPhone: phone, id: { not: excludeOrderId }, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const isFirst = previousOrders.length === 0;
  if (isFirst) {
    score += WEIGHTS.firstTimeOrder(true);
    signals.push("first-time-order");
  }

  const latestPending = previousOrders.find(
    (o) => o.status === "PENDING_RESCHEDULE",
  );
  if (latestPending) {
    score += WEIGHTS.hesitationMessages(3);
    signals.push("hesitation");
  }

  const prevFailed = previousOrders.filter((o) => o.status === "REFUSED" || o.status === "INTELLIGENT_CANCEL");
  if (prevFailed.length > 0) {
    score += prevFailed.length * 10;
    signals.push("prior-failures");
  }

  const guard = await checkZioGuard(phone);
  if (guard.flagged) {
    score += Math.min(guard.flagCount * 15, 40);
    signals.push("zio-guard-flagged");
  }

  score = Math.max(0, Math.min(100, score));

  let riskLevel: "low" | "medium" | "high";
  if (score < 30) riskLevel = "low";
  else if (score <= 60) riskLevel = "medium";
  else riskLevel = "high";

  return { score, riskLevel, signals };
}

export async function computeAndAlert(
  phone: string,
  orgId: string,
  buyerName: string,
  orderId: string,
) {
  const result = await computeScore(phone, orgId, orderId);

  await prisma.order.update({
    where: { id: orderId },
    data: { trustScore: 100 - result.score, riskLevel: result.riskLevel },
  });

  if (result.riskLevel === "high") {
    await alertSeller(orgId, highRiskAlert(buyerName, result.score));
  }

  await ensureActivationEvent(orgId, "FIRST_TRUST_SCORE");

  return result;
}

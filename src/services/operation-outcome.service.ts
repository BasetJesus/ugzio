import { prisma } from "@/lib/db";
import { safeNumber } from "@/lib/core/safe-render";

export type OutcomeAction = "confirm" | "cancel" | "unreachable" | "suspicious" | "retry";

export interface OperationOutcomeSummary {
  id: string;
  orderId: string;
  actionTaken: OutcomeAction;
  estimatedRevenueSaved: number;
  estimatedLossPrevented: number;
  riskLevelBefore: string | null;
  orderAmount: number;
  trustScoreBefore: number | null;
  attemptedBy: string | null;
  notes: string | null;
  createdAt: string;
}

export interface OutcomeStats {
  totalActions: number;
  revenueSaved: number;
  lossPrevented: number;
  confirmations: number;
  cancellations: number;
  unreachable: number;
  confirmationRate: number;
}

export async function recordOutcome(
  orgId: string,
  orderId: string,
  action: OutcomeAction,
  data: {
    revenueSaved?: number;
    lossPrevented?: number;
    riskLevelBefore?: string;
    orderAmount?: number;
    trustScoreBefore?: number;
    attemptedBy?: string;
    notes?: string;
  }
): Promise<{ success: boolean; id?: string }> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId },
      select: {
        amount: true,
        riskLevel: true,
        trustScore: true,
        deliveryProviderId: true,
      },
    });

    if (!order) {
      return { success: false };
    }

    const outcome = await prisma.operationOutcome.create({
      data: {
        organizationId: orgId,
        orderId,
        actionTaken: action,
        estimatedRevenueSaved: safeNumber(data.revenueSaved, 0),
        estimatedLossPrevented: safeNumber(data.lossPrevented, 0),
        riskLevelBefore: data.riskLevelBefore ?? order.riskLevel,
        orderAmount: safeNumber(data.orderAmount, Number(order.amount)),
        trustScoreBefore: data.trustScoreBefore ?? order.trustScore,
        attemptedBy: data.attemptedBy ?? null,
        notes: data.notes ?? null,
      },
    });

    return { success: true, id: outcome.id };
  } catch {
    return { success: false };
  }
}

export async function getOutcomesForOrder(
  orgId: string,
  orderId: string
): Promise<OperationOutcomeSummary[]> {
  try {
    const outcomes = await prisma.operationOutcome.findMany({
      where: { organizationId: orgId, orderId },
      orderBy: { createdAt: "desc" },
    });

    return outcomes.map((o) => ({
      id: o.id,
      orderId: o.orderId,
      actionTaken: o.actionTaken as OutcomeAction,
      estimatedRevenueSaved: Number(o.estimatedRevenueSaved),
      estimatedLossPrevented: Number(o.estimatedLossPrevented),
      riskLevelBefore: o.riskLevelBefore,
      orderAmount: Number(o.orderAmount),
      trustScoreBefore: o.trustScoreBefore,
      attemptedBy: o.attemptedBy,
      notes: o.notes,
      createdAt: o.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getTodayOutcomeStats(orgId: string): Promise<OutcomeStats> {
  try {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    const outcomes = await prisma.operationOutcome.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: dayStart },
      },
    });

    const totalActions = outcomes.length;
    const revenueSaved = outcomes.reduce((s, o) => s + Number(o.estimatedRevenueSaved), 0);
    const lossPrevented = outcomes.reduce((s, o) => s + Number(o.estimatedLossPrevented), 0);
    const confirmations = outcomes.filter((o) => o.actionTaken === "confirm").length;
    const cancellations = outcomes.filter((o) => o.actionTaken === "cancel").length;
    const unreachable = outcomes.filter((o) => o.actionTaken === "unreachable").length;

    const decisions = confirmations + cancellations;
    const confirmationRate = decisions > 0 ? Math.round((confirmations / decisions) * 100) : 0;

    return {
      totalActions,
      revenueSaved,
      lossPrevented,
      confirmations,
      cancellations,
      unreachable,
      confirmationRate,
    };
  } catch {
    return {
      totalActions: 0,
      revenueSaved: 0,
      lossPrevented: 0,
      confirmations: 0,
      cancellations: 0,
      unreachable: 0,
      confirmationRate: 0,
    };
  }
}

export async function getOutcomeStats(orgId: string, startDate?: Date): Promise<OutcomeStats> {
  try {
    const where: Record<string, unknown> = { organizationId: orgId };
    if (startDate) {
      where.createdAt = { gte: startDate };
    }

    const outcomes = await prisma.operationOutcome.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const totalActions = outcomes.length;
    const revenueSaved = outcomes.reduce((s, o) => s + Number(o.estimatedRevenueSaved), 0);
    const lossPrevented = outcomes.reduce((s, o) => s + Number(o.estimatedLossPrevented), 0);
    const confirmations = outcomes.filter((o) => o.actionTaken === "confirm").length;
    const cancellations = outcomes.filter((o) => o.actionTaken === "cancel").length;
    const unreachable = outcomes.filter((o) => o.actionTaken === "unreachable").length;

    const decisions = confirmations + cancellations;
    const confirmationRate = decisions > 0 ? Math.round((confirmations / decisions) * 100) : 0;

    return {
      totalActions,
      revenueSaved,
      lossPrevented,
      confirmations,
      cancellations,
      unreachable,
      confirmationRate,
    };
  } catch {
    return {
      totalActions: 0,
      revenueSaved: 0,
      lossPrevented: 0,
      confirmations: 0,
      cancellations: 0,
      unreachable: 0,
      confirmationRate: 0,
    };
  }
}


import { DEMO_MODE } from "@/lib/demo/demo-config";
import type { OverviewData } from "@/services/overview.service";
import type { ConfirmationQueue } from "@/services/confirmation.service";
import type { OrdersPageData } from "@/types/order";

export const EMPTY_OVERVIEW_DATA: OverviewData = {
  stats: {
    ordersToday: 0, ordersThisWeek: 0, revenueToday: 0, revenueThisWeek: 0,
    atRiskOrders: 0, pendingVerifications: 0, ugcReceived: 0, deliveredRate: 0,
  },
  liveOrders: [],
  riskAlerts: [],
  ugcOpportunities: [],
};

export const EMPTY_CONFIRMATION_QUEUE: ConfirmationQueue = {
  items: [], total: 0, pendingCount: 0, contactedCount: 0,
};

export const EMPTY_ORDERS_PAGE_DATA: OrdersPageData = {
  stats: { total: 0, atRisk: 0, pendingToday: 0, revenueTotal: 0, deliveredRate: 0 },
  orders: [],
};

export const EMPTY_NUMBER = 0;

export function getEmptyState(): OverviewData {
  return EMPTY_OVERVIEW_DATA;
}

async function demoValue<R>(fn: () => Promise<R>, fallback: R): Promise<R> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

// ── Overview ──

export async function getOverviewData(orgId: string): Promise<OverviewData> {
  try {
    if (DEMO_MODE) {
      const mod = await import("@/lib/demo/demo-engine");
      return mod.getDemoOverviewData(orgId);
    }
    const mod = await import("@/services/overview.service");
    return mod.getOverviewData(orgId);
  } catch {
    return EMPTY_OVERVIEW_DATA;
  }
}

export async function getRevenueAtRisk(orgId: string): Promise<number> {
  if (DEMO_MODE) {
    return demoValue(async () => {
      const mod = await import("@/lib/demo/demo-engine");
      return mod.getDemoRevenueAtRisk(orgId);
    }, 0);
  }
  return demoValue(async () => {
    const mod = await import("@/services/risk.service");
    return mod.getRevenueAtRisk(orgId);
  }, 0);
}

export async function getNeedsConfirmCount(orgId: string): Promise<number> {
  if (DEMO_MODE) {
    return demoValue(async () => {
      const mod = await import("@/lib/demo/demo-engine");
      return mod.getDemoNeedsConfirmCount(orgId);
    }, 0);
  }
  return demoValue(async () => {
    const mod = await import("@/services/risk.service");
    return mod.getNeedsConfirmCount(orgId);
  }, 0);
}

// ── Confirmation ──

export async function getConfirmationQueue(orgId: string): Promise<ConfirmationQueue> {
  try {
    if (DEMO_MODE) {
      const mod = await import("@/lib/demo/demo-engine");
      return mod.getDemoConfirmationQueue(orgId);
    }
    const mod = await import("@/services/confirmation.service");
    return mod.getConfirmationQueue(orgId);
  } catch {
    return EMPTY_CONFIRMATION_QUEUE;
  }
}

export async function getConfirmationDetail(orgId: string, orderId: string) {
  try {
    if (DEMO_MODE) {
      return null;
    }
    const mod = await import("@/services/confirmation.service");
    return mod.getConfirmationDetail(orgId, orderId);
  } catch {
    return null;
  }
}

export async function markConfirmed(
  orgId: string,
  orderId: string,
  operator: string,
  method: string = "manual_call",
  notes?: string,
): Promise<void> {
  try {
    if (DEMO_MODE) {
      const mod = await import("@/lib/demo/demo-engine");
      mod.updateDemoOrderState(orgId, orderId, "confirm");
      return;
    }
    const mod = await import("@/services/confirmation.service");
    await mod.markConfirmed(orgId, orderId, operator, method, notes);
  } catch {
    // silent fallback
  }
}

export async function markUnreachable(
  orgId: string,
  orderId: string,
  method: string = "manual_call",
  notes?: string,
): Promise<void> {
  try {
    if (DEMO_MODE) {
      const mod = await import("@/lib/demo/demo-engine");
      mod.updateDemoOrderState(orgId, orderId, "unreachable");
      return;
    }
    const mod = await import("@/services/confirmation.service");
    await mod.markUnreachable(orgId, orderId, method, notes);
  } catch {
    // silent fallback
  }
}

export async function markSuspicious(
  orgId: string,
  orderId: string,
  notes?: string,
): Promise<void> {
  try {
    if (DEMO_MODE) {
      return;
    }
    const mod = await import("@/services/confirmation.service");
    await mod.markSuspicious(orgId, orderId, notes);
  } catch {
    // silent fallback
  }
}

export async function scheduleRetry(
  orgId: string,
  orderId: string,
  notes?: string,
): Promise<void> {
  try {
    if (DEMO_MODE) {
      return;
    }
    const mod = await import("@/services/confirmation.service");
    await mod.scheduleRetry(orgId, orderId, notes);
  } catch {
    // silent fallback
  }
}

export async function cancelOrder(
  orgId: string,
  orderId: string,
  reason: string,
  operator: string,
): Promise<void> {
  try {
    if (DEMO_MODE) {
      const mod = await import("@/lib/demo/demo-engine");
      mod.updateDemoOrderState(orgId, orderId, "cancel");
      return;
    }
    const mod = await import("@/services/confirmation.service");
    await mod.cancelOrder(orgId, orderId, reason, operator);
  } catch {
    // silent fallback
  }
}

// ── Orders ──

export async function getOrdersPageData(orgId: string): Promise<OrdersPageData> {
  try {
    if (DEMO_MODE) {
      const mod = await import("@/lib/demo/demo-engine");
      return mod.getDemoOrdersPageData(orgId);
    }
    const mod = await import("@/services/order.service");
    return mod.getOrdersPageData(orgId);
  } catch {
    return EMPTY_ORDERS_PAGE_DATA;
  }
}

export async function listOrders(orgId: string) {
  try {
    if (DEMO_MODE) {
      const mod = await import("@/lib/demo/demo-engine");
      return mod.generateDemoOrders(orgId);
    }
    const mod = await import("@/services/order.service");
    return mod.listOrders(orgId);
  } catch {
    return [];
  }
}

export async function getLoopCompletionStats(orgId: string) {
  try {
    if (DEMO_MODE) {
      const mod = await import("@/lib/demo/demo-engine");
      return mod.getDemoLoopCompletionStats(orgId);
    }
    const mod = await import("@/services/overview.service");
    return mod.getLoopCompletionStats(orgId);
  } catch {
    return { totalCompleted: 0, successfulCompletions: 0, failedCompletions: 0, completionRate: 0, learningSignals: 0 };
  }
}

export async function getPendingOutcomeOrders(orgId: string) {
  try {
    const mod = await import("@/services/confirmation.service");
    return mod.getPendingOutcomeOrders(orgId);
  } catch {
    return [];
  }
}

export interface RevenueProtectionStats {
  totalRevenueAtRisk: number;
  estimatedPreventableLoss: number;
  ordersAtRisk: number;
  highRiskOrders: number;
  avgRiskScore: number;
  todayStats: {
    totalActions: number;
    revenueSaved: number;
    lossPrevented: number;
    confirmations: number;
    cancellations: number;
    unreachable: number;
    confirmationRate: number;
  };
}

const EMPTY_REVENUE_STATS: RevenueProtectionStats = {
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

export async function getRevenueProtectionStats(orgId: string): Promise<RevenueProtectionStats> {
  try {
    if (DEMO_MODE) {
      const riskMod = await import("@/services/risk.service");
      const atRisk = await riskMod.getRevenueAtRisk(orgId);
      const needsConfirm = await riskMod.getNeedsConfirmCount(orgId);
      return {
        totalRevenueAtRisk: atRisk,
        estimatedPreventableLoss: atRisk > 0 ? atRisk * 0.15 : 0,
        ordersAtRisk: needsConfirm,
        highRiskOrders: Math.round(needsConfirm * 0.4),
        avgRiskScore: 55,
        todayStats: {
          totalActions: 3,
          revenueSaved: atRisk > 0 ? atRisk * 0.2 : 0,
          lossPrevented: atRisk > 0 ? atRisk * 0.03 : 0,
          confirmations: 2,
          cancellations: 1,
          unreachable: 0,
          confirmationRate: 67,
        },
      };
    }
    const mod = await import("@/services/revenue-protection.service");
    return mod.getRevenueProtectionStats(orgId);
  } catch {
    return EMPTY_REVENUE_STATS;
  }
}

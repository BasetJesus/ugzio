import { DEMO_MODE } from "@/lib/demo/demo-config";

async function importDemo<R>(modPath: string, fn: string, args: unknown[]): Promise<R> {
  const mod = await import(modPath);
  return (mod[fn] as (...a: typeof args) => R)(...args);
}

async function importReal<R>(modPath: string, fn: string, args: unknown[]): Promise<R> {
  const mod = await import(modPath);
  return (mod[fn] as (...a: typeof args) => R)(...args);
}

// ── Overview ──

export async function getOverviewData(orgId: string) {
  if (DEMO_MODE) {
    const mod = await import("@/lib/demo/demo-engine");
    return mod.getDemoOverviewData(orgId);
  }
  const mod = await import("@/services/overview.service");
  return mod.getOverviewData(orgId);
}

export async function getRevenueAtRisk(orgId: string): Promise<number> {
  if (DEMO_MODE) {
    return await importDemo<number>("@/lib/demo/demo-engine", "getDemoRevenueAtRisk", [orgId]);
  }
  return await importReal<number>("@/services/risk.service", "getRevenueAtRisk", [orgId]);
}

export async function getNeedsConfirmCount(orgId: string): Promise<number> {
  if (DEMO_MODE) {
    return await importDemo<number>("@/lib/demo/demo-engine", "getDemoNeedsConfirmCount", [orgId]);
  }
  return await importReal<number>("@/services/risk.service", "getNeedsConfirmCount", [orgId]);
}

// ── Confirmation ──

export async function getConfirmationQueue(orgId: string) {
  if (DEMO_MODE) {
    const mod = await import("@/lib/demo/demo-engine");
    return mod.getDemoConfirmationQueue(orgId);
  }
  const mod = await import("@/services/confirmation.service");
  return mod.getConfirmationQueue(orgId);
}

export async function getConfirmationDetail(orgId: string, orderId: string) {
  if (DEMO_MODE) {
    return null;
  }
  const mod = await import("@/services/confirmation.service");
  return mod.getConfirmationDetail(orgId, orderId);
}

export async function markConfirmed(
  orgId: string,
  orderId: string,
  operator: string,
  method: string = "manual_call",
  notes?: string,
): Promise<void> {
  if (DEMO_MODE) {
    const mod = await import("@/lib/demo/demo-engine");
    mod.updateDemoOrderState(orgId, orderId, "confirm");
    return;
  }
  const mod = await import("@/services/confirmation.service");
  return mod.markConfirmed(orgId, orderId, operator, method, notes);
}

export async function markUnreachable(
  orgId: string,
  orderId: string,
  method: string = "manual_call",
  notes?: string,
): Promise<void> {
  if (DEMO_MODE) {
    const mod = await import("@/lib/demo/demo-engine");
    mod.updateDemoOrderState(orgId, orderId, "unreachable");
    return;
  }
  const mod = await import("@/services/confirmation.service");
  return mod.markUnreachable(orgId, orderId, method, notes);
}

export async function markSuspicious(
  orgId: string,
  orderId: string,
  notes?: string,
): Promise<void> {
  if (DEMO_MODE) {
    return;
  }
  const mod = await import("@/services/confirmation.service");
  return mod.markSuspicious(orgId, orderId, notes);
}

export async function scheduleRetry(
  orgId: string,
  orderId: string,
  notes?: string,
): Promise<void> {
  if (DEMO_MODE) {
    return;
  }
  const mod = await import("@/services/confirmation.service");
  return mod.scheduleRetry(orgId, orderId, notes);
}

export async function cancelOrder(
  orgId: string,
  orderId: string,
  reason: string,
  operator: string,
): Promise<void> {
  if (DEMO_MODE) {
    const mod = await import("@/lib/demo/demo-engine");
    mod.updateDemoOrderState(orgId, orderId, "cancel");
    return;
  }
  const mod = await import("@/services/confirmation.service");
  return mod.cancelOrder(orgId, orderId, reason, operator);
}

// ── Orders ──

export async function getOrdersPageData(orgId: string) {
  if (DEMO_MODE) {
    const mod = await import("@/lib/demo/demo-engine");
    return mod.getDemoOrdersPageData(orgId);
  }
  const mod = await import("@/services/order.service");
  return mod.getOrdersPageData(orgId);
}

export async function listOrders(orgId: string) {
  if (DEMO_MODE) {
    const mod = await import("@/lib/demo/demo-engine");
    return mod.generateDemoOrders(orgId);
  }
  const mod = await import("@/services/order.service");
  return mod.listOrders(orgId);
}

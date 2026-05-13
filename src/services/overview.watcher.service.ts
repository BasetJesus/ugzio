import { eventCountByOrg } from "@/lib/events/event-store";

const lastKnownCounts = new Map<string, number>();

export function getPendingRefreshCount(orgId: string): number {
  const last = lastKnownCounts.get(orgId) ?? 0;
  const current = eventCountByOrg(orgId);
  const delta = current - last;
  return delta > 0 ? delta : 0;
}

export function drainPendingRefresh(orgId: string): number {
  const last = lastKnownCounts.get(orgId) ?? 0;
  const current = eventCountByOrg(orgId);
  const delta = current - last;
  const count = delta > 0 ? delta : 0;
  lastKnownCounts.set(orgId, current);
  return count;
}

export function rebuildFromEventStore(orgId: string): void {
  lastKnownCounts.set(orgId, eventCountByOrg(orgId));
}

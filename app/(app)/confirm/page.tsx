import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getConfirmationQueue, getPendingOutcomeOrders } from "@/services/demo-orchestrator.service";
import { getPsychologyPreview } from "@/services/whatsapp-sequence.service";
import type { ConfirmationQueueItem, PendingOutcomeOrder } from "@/services/confirmation.service";
import type { PsychologyPreview } from "@/types/whatsapp";
import { MiniKpiCard } from "@/components/shared/KpiCard";
import ConfirmationPanel from "@/components/confirm/ConfirmationPanel";

export const dynamic = "force-dynamic";

export default async function ConfirmPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  let queue: { items: ConfirmationQueueItem[]; total: number; pendingCount: number; contactedCount: number } = { items: [], total: 0, pendingCount: 0, contactedCount: 0 };
  let pendingOutcomes: PendingOutcomeOrder[] = [];
  try {
    [queue, pendingOutcomes] = await Promise.all([
      getConfirmationQueue(orgId),
      getPendingOutcomeOrders(orgId),
    ]);
  } catch (e) {
    console.error("[confirm] service error", e);
  }

  const highRiskItems = queue.items.filter((i) => i.riskLevel === "high");
  const revenueAtRisk = Math.round(
    highRiskItems.reduce((s, i) => s + i.amount, 0) * 0.3
  );
  const potentialLossPrevented = queue.items
    .filter((i) => i.confirmStatus === "confirmed")
    .reduce((s, i) => s + i.amount, 0);

  const psychologyMap: Record<string, PsychologyPreview> = {};
  for (const item of queue.items) {
    psychologyMap[item.orderId] = getPsychologyPreview({
      riskLevel: item.riskLevel,
      trustScore: item.trustScore,
      orderAmount: item.amount,
      buyerName: item.buyerName,
      firstTimeBuyer: item.trustScore < 40,
      noResponseCount: item.lastAttemptOutcome === "no_answer" ? 1 : 0,
      previousConfirmationAttempts: item.lastAttemptAt ? 1 : 0,
    });
  }

  return (
    <div data-state="decision" className="space-y-section">
      <div>
        <h1 className="text-display-lg text-[var(--text-primary)]">Decision Queue</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          What needs action right now
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-card">
        <MiniKpiCard label="Revenue at risk" value={`${revenueAtRisk.toFixed(0)} TND`} tier="high" />
        <MiniKpiCard label="High risk orders" value={highRiskItems.length} tier="medium" />
        <MiniKpiCard label="Pending confirmation" value={queue.pendingCount} tier="neutral" />
        <MiniKpiCard label="Loss prevented" value={`${potentialLossPrevented.toFixed(0)} TND`} tier="low" />
      </div>

      <ConfirmationPanel
        items={queue.items}
        pendingCount={queue.pendingCount}
        contactedCount={queue.contactedCount}
        total={queue.total}
        psychologyMap={psychologyMap}
        pendingOutcomes={pendingOutcomes}
      />
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getConfirmationQueue, getPendingOutcomeOrders } from "@/services/demo-orchestrator.service";
import { getPsychologyPreview } from "@/services/whatsapp-sequence.service";
import type { ConfirmationQueueItem, PendingOutcomeOrder } from "@/services/confirmation.service";
import type { PsychologyPreview } from "@/types/whatsapp";
import { MiniKpiCard } from "@/components/shared/KpiCard";
import SystemNarrative from "@/components/shared/SystemNarrative";
import ConfirmationPanel from "@/components/confirm/ConfirmationPanel";
import OperationalPresenceLayer from "@/components/shared/OperationalPresenceLayer";
import { getServerLang, st } from "@/lib/core/server-lang";

export const dynamic = "force-dynamic";

export default async function ConfirmPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();

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

  const needsAttention = queue.pendingCount > 0;
  const revenueLabel = `${revenueAtRisk.toFixed(0)} TND`;

  return (
    <OperationalPresenceLayer>
    <div data-state="decision" className="space-y-section">
      <SystemNarrative
        title={needsAttention ? st(lang, "cf.title-pending") : st(lang, "cf.title-idle")}
        narrative={
          needsAttention
            ? `${queue.pendingCount} ${st(lang, "cf.pending").toLowerCase()} — ${highRiskItems.length} ${st(lang, "cf.orders-at-risk").toLowerCase()}, ${revenueAtRisk.toFixed(0)} TND exposés`
            : st(lang, "cf.all-clear")
        }
        emotion={needsAttention ? "tense" : "calm"}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-card">
        <MiniKpiCard label={st(lang, "ov.revenue-at-risk")} value={revenueLabel} tier="high" emotion="tense" href="/confirm" />
        <MiniKpiCard label={st(lang, "cf.orders-at-risk")} value={highRiskItems.length} tier="medium" href="/confirm" />
        <MiniKpiCard label={st(lang, "cf.pending")} value={queue.pendingCount} tier="neutral" href="/confirm" />
        <MiniKpiCard label={st(lang, "cf.losses-prevented")} value={`${potentialLossPrevented.toFixed(0)} TND`} tier="low" emotion="protective" href="/shield" />
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
    </OperationalPresenceLayer>
  );
}

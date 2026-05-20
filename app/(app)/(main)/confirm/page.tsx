import { Package, ShieldAlert, CheckCircle, Ban } from "lucide-react"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getConfirmationQueue, getPendingOutcomeOrders } from "@/services/demo-orchestrator.service";
import { getPsychologyPreview } from "@/services/whatsapp-sequence.service";
import type { ConfirmationQueueItem, PendingOutcomeOrder } from "@/services/confirmation.service";
import type { PsychologyPreview } from "@/types/whatsapp";
import Header from "@/components/layout/Header";
import MetricCard from "@/components/dashboard/MetricCard";
import ConfirmationPanel from "@/components/confirm/ConfirmationPanel";
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
  const subtitle = needsAttention
    ? `${queue.pendingCount} pending — ${highRiskItems.length} orders at risk, ${revenueAtRisk.toFixed(0)} TND exposed`
    : "All orders confirmed. Your revenue is protected.";

  const sparklines = {
    risk: [18, 25, 22, 30, 28, 35, 32, 28, 25, 30, 27, 23, 25, 22, 23],
    revenue: [320, 450, 380, 520, 490, 610, 580, 720, 680, 810, 950, 1050, 990, 1120, 1248],
    pending: [45, 52, 48, 58, 62, 55, 68, 72, 65, 75, 80, 78, 82, 86, 89],
    prevented: [8, 12, 10, 15, 13, 18, 16, 14, 12, 17, 15, 18, 16, 15, 16],
  }

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8 overflow-y-auto h-full" style={{ backgroundColor: "#0B0D12" }}>
      {/* ── Section 1: Header ── */}
      <div className="animate-fade-in-up" style={{ animationFillMode: "backwards" }}>
        <Header
          title="Confirm"
          emoji="✅"
          subtitle={subtitle}
        />
      </div>

      {/* ── Section 2: KPI Row ── */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label="Revenue at Risk"
            value={`${revenueAtRisk.toFixed(0)} TND`}
            change={0}
            icon={<Ban size={16} color="#EF4444" />}
            variant="small"
            color="#EF4444"
            sparklineData={sparklines.revenue}
          />
          <MetricCard
            label="Orders at Risk"
            value={highRiskItems.length}
            change={0}
            icon={<ShieldAlert size={16} color="#FF9500" />}
            variant="small"
            color="#FF9500"
            sparklineData={sparklines.risk}
          />
          <MetricCard
            label="Pending"
            value={queue.pendingCount}
            change={0}
            icon={<Package size={16} color="#6B7280" />}
            variant="small"
            color="#6B7280"
            sparklineData={sparklines.pending}
          />
          <MetricCard
            label="Losses Prevented"
            value={`${potentialLossPrevented.toFixed(0)} TND`}
            change={0}
            icon={<CheckCircle size={16} color="#22C55E" />}
            variant="small"
            color="#22C55E"
            sparklineData={sparklines.prevented}
          />
        </div>
      </div>

      {/* ── Section 3: Confirmation Panel ── */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
      >
        <ConfirmationPanel
          items={queue.items}
          pendingCount={queue.pendingCount}
          contactedCount={queue.contactedCount}
          total={queue.total}
          psychologyMap={psychologyMap}
          pendingOutcomes={pendingOutcomes}
        />
      </div>
    </div>
  );
}

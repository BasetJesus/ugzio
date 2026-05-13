import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getRevenueAtRisk, getNeedsConfirmCount, getRevenueProtectionStats } from "@/services/demo-orchestrator.service";
import type { RevenueProtectionStats } from "@/services/demo-orchestrator.service";
import KpiCard, { MiniKpiCard } from "@/components/shared/KpiCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  let [revenueAtRisk, needsAction, protectionStats] = [0, 0, null as RevenueProtectionStats | null];
  try {
    [revenueAtRisk, needsAction, protectionStats] = await Promise.all([
      getRevenueAtRisk(orgId),
      getNeedsConfirmCount(orgId),
      getRevenueProtectionStats(orgId),
    ]);
  } catch (e) {
    console.error("[overview] service error", e);
  }

  const today = protectionStats?.todayStats;
  const protectedToday = today?.revenueSaved ?? 0;
  const preventedToday = today?.lossPrevented ?? 0;
  const confirmationRate = today?.confirmationRate ?? 0;

  return (
    <div className="space-y-6" data-state="live">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Live Revenue Stream</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">What is happening now</p>
        </div>
        <Link
          href="/orders/import"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          + Import Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Revenue at risk"
          value={`${revenueAtRisk.toFixed(0)} TND`}
          icon="⚠️"
          tier="high"
        />
        <KpiCard
          label="Orders needing action"
          value={needsAction}
          icon="📦"
          tier="medium"
        />
        <KpiCard
          label="Protection status"
          value={revenueAtRisk > 0 ? "Active" : "Stable"}
          icon="🛡️"
          tier={revenueAtRisk > 0 ? "low" : "neutral"}
        />
      </div>

      {today && today.totalActions > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Today&apos;s Outcomes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniKpiCard
              label="Revenue Protected"
              value={`${protectedToday.toFixed(0)} TND`}
              tier="low"
            />
            <MiniKpiCard
              label="RTS Loss Prevented"
              value={`${preventedToday.toFixed(0)} TND`}
              tier="low"
            />
            <MiniKpiCard
              label="Confirmation Rate"
              value={`${confirmationRate}%`}
              tier={confirmationRate >= 70 ? "low" : confirmationRate >= 50 ? "medium" : "high"}
            />
            <MiniKpiCard
              label="Actions Taken"
              value={today.totalActions}
              tier="neutral"
            />
          </div>
        </div>
      )}

      {today && today.totalActions === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-sm font-medium text-[var(--text-primary)]">No actions taken yet today</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            <Link href="/confirm" className="text-[var(--accent)] hover:underline">
              Go to confirmation queue
            </Link>{" "}
            to start protecting revenue
          </p>
        </div>
      )}
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getGrowthMetrics } from "@/services/growth.service";
import { getUgcStats } from "@/services/grow.service";
import KpiCard, { MiniKpiCard } from "@/components/shared/KpiCard";
import SystemNarrative from "@/components/shared/SystemNarrative";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  let metrics: Awaited<ReturnType<typeof getGrowthMetrics>> = {
    requestsSent: 0, responsesReceived: 0, responseRate: 0,
    totalApproved: 0, totalRejected: 0, approvalRate: 0,
    ugcRevenue: 0, topProducts: [],
  };
  let stats: Awaited<ReturnType<typeof getUgcStats>> = { total: 0, received: 0, approved: 0, rejected: 0, rate: 0 };
  try {
    [metrics, stats] = await Promise.all([
      getGrowthMetrics(orgId),
      getUgcStats(orgId),
    ]);
  } catch (e) {
    console.error("[growth] service error", e);
  }

  const hasData = metrics.requestsSent > 0 || stats.total > 0;

  return (
    <div className="space-y-section">
      <SystemNarrative
        title="Growth"
        narrative={hasData ? "Your UGC collection engine performance" : "Start collecting UGC to see growth metrics here"}
        emotion={hasData ? "achievement" : "calm"}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-card">
        <MiniKpiCard label="Requests sent" value={metrics.requestsSent} tier="neutral" />
        <MiniKpiCard
          label="Response rate"
          value={`${metrics.responseRate}%`}
          tier={metrics.responseRate >= 50 ? "low" : metrics.responseRate >= 20 ? "medium" : "neutral"}
          emotion={metrics.responseRate >= 50 ? "protective" : undefined}
        />
        <MiniKpiCard label="Total collected" value={stats.total} tier="neutral" />
        <MiniKpiCard label="Approved for repost" value={metrics.totalApproved} tier={metrics.totalApproved > 0 ? "low" : "neutral"} emotion={metrics.totalApproved > 0 ? "achievement" : undefined} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-card">
        <MiniKpiCard label="Rejected" value={metrics.totalRejected} tier={metrics.totalRejected > 0 ? "medium" : "neutral"} />
        <MiniKpiCard label="Approval rate" value={`${metrics.approvalRate}%`} tier={metrics.approvalRate >= 60 ? "low" : "neutral"} />
        <KpiCard label="Revenue from UGC buyers" value={`${metrics.ugcRevenue.toFixed(0)} TND`} tier={metrics.ugcRevenue > 0 ? "low" : "neutral"} emotion={metrics.ugcRevenue > 0 ? "protective" : undefined}>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Total value of orders that submitted UGC</p>
        </KpiCard>
      </div>

      {metrics.topProducts.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Top UGC products</h3>
          <div className="space-y-2">
            {metrics.topProducts.map((p, i) => (
              <div key={p.product} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-[var(--text-tertiary)] w-4">{i + 1}.</span>
                  <span className="text-xs text-[var(--text-primary)] truncate">{p.product}</span>
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)]">{p.count} UGC</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/inbox"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          View UGC Inbox
        </Link>
        <Link
          href="/settings/ugc"
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]/30 transition-colors"
        >
          Configure Templates
        </Link>
      </div>
    </div>
  );
}

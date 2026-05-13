import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getOverviewData } from "@/services/overview.service";
import { drainPendingRefresh } from "@/services/overview.watcher.service";
import { computeSystemState } from "@/services/system-state.service";
import StatsCards from "@/components/overview/StatsCards";
import LiveOrdersFeed from "@/components/overview/LiveOrdersFeed";
import RiskAlertsPanel from "@/components/overview/RiskAlertsPanel";
import UGCOpportunitiesPanel from "@/components/overview/UGCOpportunitiesPanel";
import SystemStateSnapshot from "@/components/overview/SystemStateSnapshot";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const pendingRefreshes = drainPendingRefresh(orgId);
  const data = await getOverviewData(orgId);
  const systemState = computeSystemState(orgId);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Command Center</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Operations overview &mdash; what needs attention</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-600">
          {pendingRefreshes > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-amber-400">
              {pendingRefreshes} new
            </span>
          )}
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      <StatsCards stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveOrdersFeed orders={data.liveOrders} />
        <RiskAlertsPanel alerts={data.riskAlerts} />
      </div>

      <UGCOpportunitiesPanel opportunities={data.ugcOpportunities} />

      <details className="group">
        <summary className="text-xs text-zinc-600 cursor-pointer hover:text-zinc-400 select-none">
          System state snapshot
        </summary>
        <SystemStateSnapshot state={systemState} />
      </details>
    </div>
  );
}

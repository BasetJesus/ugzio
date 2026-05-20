import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getGrowthMetrics, getUgcOpportunities } from "@/services/grow.service";
import { getFlowStats } from "@/services/zioflow.service";
import { getLoopCompletionStats } from "@/services/overview.service";
import GrowthViewClient from "./GrowthViewClient";

export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [metrics, opportunities, flowStats, loopStats] = await Promise.all([
    getGrowthMetrics(orgId).catch(() => ({ requestsSent: 0, responsesReceived: 0, responseRate: 0, totalApproved: 0, totalRejected: 0, approvalRate: 0, ugcRevenue: 0, topProducts: [] })),
    getUgcOpportunities(orgId, 5).catch(() => []),
    getFlowStats(orgId).catch(() => ({ totalPublished: 0, totalQueued: 0, byPlatform: [] })),
    getLoopCompletionStats(orgId).catch(() => ({ totalCompleted: 0, successfulCompletions: 0, failedCompletions: 0, completionRate: 0, learningSignals: 0 })),
  ]);

  return (
    <GrowthViewClient
      metrics={metrics}
      opportunities={opportunities}
      flowStats={flowStats}
      loopStats={loopStats}
    />
  );
}

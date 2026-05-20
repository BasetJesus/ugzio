import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getGrowthMetrics } from "@/services/growth.service";
import { getUgcOpportunities } from "@/services/ugc-intelligence.service";
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
    getGrowthMetrics(orgId),
    getUgcOpportunities(orgId, 5),
    getFlowStats(orgId),
    getLoopCompletionStats(orgId),
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

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getRevenueProtectionStats, getTodayProtectedRevenue } from "@/services/revenue-protection.service";
import { getOutcomeStats } from "@/services/operation-outcome.service";
import { getOverviewData } from "@/services/overview.service";
import StatsClient from "./StatsClient";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [rpStats, todayProtected, allTimeOutcomes, overview] = await Promise.all([
    getRevenueProtectionStats(orgId),
    getTodayProtectedRevenue(orgId),
    getOutcomeStats(orgId),
    getOverviewData(orgId),
  ]);

  return (
    <StatsClient
      rpStats={rpStats}
      todayProtected={todayProtected}
      allTimeOutcomes={allTimeOutcomes}
      overview={overview}
    />
  );
}

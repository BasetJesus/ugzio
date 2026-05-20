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
    getRevenueProtectionStats(orgId).catch(() => ({
      totalRevenueAtRisk: 0, estimatedPreventableLoss: 0, ordersAtRisk: 0, highRiskOrders: 0, avgRiskScore: 0,
      todayStats: { totalActions: 0, revenueSaved: 0, lossPrevented: 0, confirmations: 0, cancellations: 0, unreachable: 0, confirmationRate: 0 },
    })),
    getTodayProtectedRevenue(orgId).catch(() => []),
    getOutcomeStats(orgId).catch(() => ({ totalActions: 0, revenueSaved: 0, lossPrevented: 0, confirmations: 0, cancellations: 0, unreachable: 0, confirmationRate: 0 })),
    getOverviewData(orgId).catch(() => ({
      stats: { ordersToday: 0, ordersThisWeek: 0, revenueToday: 0, revenueThisWeek: 0, atRiskOrders: 0, pendingVerifications: 0, ugcReceived: 0, deliveredRate: 0 },
      liveOrders: [], riskAlerts: [], ugcOpportunities: [],
    })),
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

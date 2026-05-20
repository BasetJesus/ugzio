import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getHighRiskAlerts, getAggregateRiskStats, getRiskDashboard } from "@/services/risk.service";
import ZioShieldClient from "./ZioShieldClient";

export const dynamic = "force-dynamic";

export default async function ShieldPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [alerts, aggregate, dashboard] = await Promise.all([
    getHighRiskAlerts(orgId, 20).catch(() => []),
    getAggregateRiskStats(orgId).catch(() => ({ averageScore: 0, highRiskCount: 0, todayOrders: 0, totalOrders: 0, revenueAtRisk: 0 })),
    getRiskDashboard(orgId).catch(() => ({ recentOrders: [], totalOrders: 0, todayOrders: 0, todayRevenue: 0, highRiskCount: 0, verificationRate: 0 })),
  ]);

  return (
    <ZioShieldClient
      alerts={alerts}
      aggregate={aggregate}
      recentOrders={dashboard.recentOrders}
    />
  );
}

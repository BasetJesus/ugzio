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
    getHighRiskAlerts(orgId, 20),
    getAggregateRiskStats(orgId),
    getRiskDashboard(orgId),
  ]);

  return (
    <ZioShieldClient
      alerts={alerts}
      aggregate={aggregate}
      recentOrders={dashboard.recentOrders}
    />
  );
}

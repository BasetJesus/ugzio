import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getDashboardData } from "@/services/dashboard.service";
import DashboardContent from "@/components/dashboard/DashboardContent";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const data = await getDashboardData(orgId);

  return (
    <DashboardContent
      ordersToday={data.ordersToday}
      needsConfirm={data.needsConfirm}
      pendingConfirm={data.pendingConfirm}
      inboxCount={data.inboxCount}
      ugcCount={data.ugcCount}
      totalOrders={data.totalOrders}
      rtsPrevented={data.rtsPrevented}
      revenueSavedAmount={data.revenueSavedAmount}
      deliveredRate={data.deliveredRate}
      riskAlerts={data.riskAlerts}
      recentOrders={data.recentOrders}
      chartData={data.chartData}
    />
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getOrdersPageData } from "@/services/demo-orchestrator.service"
import type { OrdersPageData } from "@/types/order"
import OrdersHeader from "@/components/orders/OrdersHeader"
import OrdersPageClient from "@/components/orders/OrdersPageClient"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  let data: OrdersPageData = { stats: { total: 0, atRisk: 0, pendingToday: 0, revenueTotal: 0, deliveredRate: 0 }, orders: [] };
  try {
    data = await getOrdersPageData(orgId);
  } catch (e) {
    console.error("[orders] service error", e);
  }

  return (
    <div data-state="history" className="space-y-4 px-0 sm:px-0">
      <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Order History</h1>
      <OrdersHeader stats={data.stats} />
      <OrdersPageClient orders={data.orders} />
    </div>
  )
}

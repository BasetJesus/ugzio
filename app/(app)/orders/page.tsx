import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getOrdersPageData } from "@/services/demo-orchestrator.service"
import type { OrdersPageData } from "@/types/order"
import OrdersHeader from "@/components/orders/OrdersHeader"
import OrdersPageClient from "@/components/orders/OrdersPageClient"
import { getServerLang, st } from "@/lib/core/server-lang"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();

  let data: OrdersPageData = { stats: { total: 0, atRisk: 0, pendingToday: 0, revenueTotal: 0, deliveredRate: 0 }, orders: [] };
  try {
    data = await getOrdersPageData(orgId);
  } catch (e) {
    console.error("[orders] service error", e);
  }

  return (
    <div data-state="history" className="space-y-section">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-[var(--text-primary)]">{st(lang, "ord.title")}</h1>
        <Link
          href="/orders/import"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--accent)]/90"
        >
          {st(lang, "common.import")}
        </Link>
      </div>
      <OrdersHeader stats={data.stats} />
      <OrdersPageClient orders={data.orders} />
    </div>
  )
}

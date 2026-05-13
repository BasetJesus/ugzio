import { getOrdersPageData } from "@/services/demo-orchestrator.service"
import { requireSession } from "@/services/auth.service"
import OrdersHeader from "@/components/orders/OrdersHeader"
import OrdersPageClient from "@/components/orders/OrdersPageClient"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const { orgId } = await requireSession()
  const data = await getOrdersPageData(orgId)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="text-xl font-bold text-zinc-100">Orders</h1>
      <OrdersHeader stats={data.stats} />
      <OrdersPageClient orders={data.orders} />
    </div>
  )
}

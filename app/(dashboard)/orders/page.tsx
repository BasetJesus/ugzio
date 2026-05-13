import Link from "next/link"
import { getMockOrdersPageData } from "@/services/order.service"
import OrdersHeader from "@/components/orders/OrdersHeader"
import OrdersPageClient from "@/components/orders/OrdersPageClient"

export default function OrdersPage() {
  const data = getMockOrdersPageData()

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Orders</h1>
        <Link
          href="/orders/new"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
        >
          + New
        </Link>
      </div>
      <OrdersHeader stats={data.stats} />
      <OrdersPageClient orders={data.orders} />
    </div>
  )
}

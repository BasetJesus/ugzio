import TrustScoreBar from "@/components/dashboard/TrustScoreBar"
import RiskBadge from "@/components/dashboard/RiskBadge"

interface Order {
  id: string
  buyerName: string
  buyerPhone: string
  amount: number
  trustScore: number
  riskLevel: string
  status: string
  createdAt: Date
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
        <p className="text-zinc-500">No orders yet. Create your first order to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-zinc-300">Recent Orders</h2>
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-zinc-200">{order.buyerName}</p>
              <p className="truncate text-xs text-zinc-500">{order.buyerPhone}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-medium text-emerald-300">{Number(order.amount).toFixed(3)} TND</p>
              <div className="mt-1">
                <RiskBadge risk={order.riskLevel as "low" | "medium" | "high"} />
              </div>
              <div className="mt-2 w-24">
                <TrustScoreBar score={order.trustScore} size="sm" />
              </div>
              <p className="mt-1 text-[10px] text-zinc-600">{order.status}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

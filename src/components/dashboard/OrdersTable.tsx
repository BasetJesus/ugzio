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
      <div className="px-6 py-12 text-center">
        <p className="text-[var(--text-secondary)]">No orders yet. Create your first order to get started.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recent Orders</h2>
      <div className="divide-y divide-[var(--nav-border)]">
        {orders.map((order) => (
          <div key={order.id} className="flex items-start justify-between gap-4 px-1 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[var(--text-primary)]">{order.buyerName}</p>
              <p className="truncate text-xs text-[var(--text-secondary)]">{order.buyerPhone}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-medium text-[var(--success-green)]">{Number(order.amount).toFixed(3)} TND</p>
              <div className="mt-1">
                <RiskBadge risk={order.riskLevel as "low" | "medium" | "high"} />
              </div>
              <div className="mt-2 w-24">
                <TrustScoreBar score={order.trustScore} size="sm" />
              </div>
              <p className="mt-1 text-[10px] text-[var(--text-tertiary)]">{order.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import Link from "next/link"

interface Order {
  id: string
  buyerName: string
  buyerPhone: string
  amount: number
  trustScore: number
  riskLevel: string
  status: string
}

export default function RiskAlerts({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-red-400">🔴 Commandes à risque élevé</h2>
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border border-red-900/30 bg-red-950/20 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-200">{order.buyerName}</p>
              <p className="text-xs text-zinc-500">{order.buyerPhone}</p>
              <p className="mt-1 text-xs text-zinc-400">{Number(order.amount).toFixed(3)} TND · Score {order.trustScore}/100</p>
            </div>
            <div className="shrink-0">
              <Link
                href={`/api/v1/zioconfirm/send?orderId=${order.id}`}
                className="inline-block rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-500"
              >
                Send WhatsApp Confirm
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

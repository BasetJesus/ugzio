"use client"

import type { OrderTableItem, RiskLevel } from "@/types/order"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import TrustScoreMeter from "@/components/orders/TrustScoreMeter"
import { RISK_META } from "@/lib/risk/config"

interface Props {
  orders: OrderTableItem[]
  totalCount: number
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const meta = RISK_META[level]
  if (!meta) return null
  return (
    <span className={`text-sm font-semibold ${meta.color}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}

export default function OrdersTable({ orders, totalCount }: Props) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center px-5">
        <div className="h-12 w-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
          <span className="text-base text-white/40">—</span>
        </div>
        <p className="text-base font-medium text-white">No orders yet</p>
        <p className="mt-1 text-sm text-white/50">Orders will appear here once created.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border border-white/10 p-4"
          style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1 mr-3">
              <p className="text-base font-semibold text-white truncate">{order.customer.name}</p>
              <p className="text-sm text-white/50">{order.customer.phone}</p>
              <p className="text-sm text-white/30">{order.customer.wilaya}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-white">{order.amount.toFixed(3)}</p>
              <p className="text-xs text-white/40">TND</p>
            </div>
          </div>

          {/* Product row */}
          <p className="text-sm text-white/70 mb-3 truncate">{order.product}</p>

          {/* Status row */}
          <div className="flex items-center justify-between mb-3">
            <OrderStatusBadge status={order.status} />
            <RiskBadge level={order.riskLevel} />
          </div>

          {/* Trust score + payment + delivery */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex-1">
              <p className="text-xs text-white/40 mb-1">Trust</p>
              <TrustScoreMeter score={order.trustScore} />
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Paiement</p>
              <p className="text-sm font-medium text-white/70">{order.paymentStatus}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Livraison</p>
              <p className="text-sm font-medium text-white/70">{order.deliveryState}</p>
            </div>
          </div>
        </div>
      ))}

      <p className="text-center text-sm text-white/30 pt-2">
        {totalCount} order{totalCount !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

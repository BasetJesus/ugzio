"use client"

import type { OrderTableItem, RiskLevel } from "@/types/order"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import TrustScoreMeter from "@/components/orders/TrustScoreMeter"
import { RISK_META } from "@/lib/risk/config"
import EmptyState from "@/components/shared/EmptyState"
import { t } from "@/lib/core/copy"

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
    return <EmptyState icon="📦" titleKey="empty.orders.title" descKey="empty.orders.desc" />
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
        >
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1 mr-3">
              <p className="text-base font-semibold text-[var(--text-primary)] truncate">{order.customer.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">{order.customer.phone}</p>
              <p className="text-sm text-[var(--text-tertiary)]">{order.customer.wilaya}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-[var(--text-primary)]">{order.amount.toFixed(3)}</p>
              <p className="text-xs text-[var(--text-tertiary)]">TND</p>
            </div>
          </div>

          {/* Product row */}
          <p className="text-sm text-[var(--text-secondary)] mb-3 truncate">{order.product}</p>

          {/* Status row */}
          <div className="flex items-center justify-between mb-3">
            <OrderStatusBadge status={order.status} />
            <RiskBadge level={order.riskLevel} />
          </div>

          {/* Trust score + payment + delivery */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
            <div className="flex-1">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">{t("label.trust")}</p>
              <TrustScoreMeter score={order.trustScore} />
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-tertiary)]">{t("label.paiement")}</p>
              <p className="text-sm font-medium text-[var(--text-secondary)]">{order.paymentStatus}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-tertiary)]">{t("label.livraison")}</p>
              <p className="text-sm font-medium text-[var(--text-secondary)]">{order.deliveryState}</p>
            </div>
          </div>
        </div>
      ))}

      <p className="text-center text-sm text-[var(--text-tertiary)] pt-2">
        {totalCount} commande{totalCount !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

"use client"

import type { OrderTableItem } from "@/types/order"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import TrustScoreMeter from "@/components/orders/TrustScoreMeter"
import { RISK_META } from "@/lib/risk/config"

const PAYMENT_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-[var(--warning-amber)]" },
  confirmed: { label: "Paid", color: "text-[var(--success-green)]" },
  failed: { label: "Failed", color: "text-[var(--risk-red)]" },
  refunded: { label: "Refunded", color: "text-[var(--text-tertiary)]" },
}

const DELIVERY_META: Record<string, { label: string; color: string }> = {
  on_time: { label: "On Time", color: "text-[var(--success-green)]" },
  delayed: { label: "Delayed", color: "text-[var(--warning-amber)]" },
  at_risk: { label: "At Risk", color: "text-[var(--risk-red)]" },
  delivered: { label: "Delivered", color: "text-[var(--success-green)]" },
  returned: { label: "Returned", color: "text-[var(--risk-red)]" },
}

interface Props {
  orders: OrderTableItem[]
  totalCount: number
}

export default function OrdersTable({ orders, totalCount }: Props) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="text-4xl">📦</span>
        <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">No orders yet</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Orders will appear here once created.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--table-border)] text-left text-xs uppercase text-[var(--text-tertiary)]">
            <th className="pb-2 pr-4 font-medium">Customer</th>
            <th className="pb-2 pr-4 font-medium">Product</th>
            <th className="pb-2 pr-4 font-medium text-right">Amount</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Risk</th>
            <th className="pb-2 pr-4 font-medium">Trust</th>
            <th className="pb-2 pr-4 font-medium">Payment</th>
            <th className="pb-2 font-medium">Delivery</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className={`border-b border-[var(--table-border)] border-l-2 hover:bg-[var(--table-row-hover)] transition-colors ${RISK_META[order.riskLevel].border}`}
            >
              <td className="py-3 pr-4">
                <p className="font-semibold text-[var(--text-primary)]">{order.customer.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{order.customer.phone}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{order.customer.wilaya}</p>
              </td>
              <td className="py-3 pr-4 text-[var(--text-primary)] max-w-[160px] truncate">{order.product}</td>
              <td className="py-3 pr-4 text-right font-medium text-[var(--success-green)] whitespace-nowrap">{order.amount.toFixed(3)} TND</td>
              <td className="py-3 pr-4"><OrderStatusBadge status={order.status} /></td>
              <td className="py-3 pr-4">
                <span className={`text-xs font-semibold ${RISK_META[order.riskLevel].color}`}>
                  {order.riskLevel.toUpperCase()}
                </span>
              </td>
              <td className="py-3 pr-4"><TrustScoreMeter score={order.trustScore} /></td>
              <td className="py-3 pr-4">
                <span className={`text-xs font-semibold ${PAYMENT_META[order.paymentStatus]?.color ?? "text-[var(--text-tertiary)]"}`}>
                  {PAYMENT_META[order.paymentStatus]?.label ?? order.paymentStatus}
                </span>
              </td>
              <td className="py-3">
                <span className={`text-xs font-semibold ${DELIVERY_META[order.deliveryState]?.color ?? "text-[var(--text-tertiary)]"}`}>
                  {DELIVERY_META[order.deliveryState]?.label ?? order.deliveryState}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

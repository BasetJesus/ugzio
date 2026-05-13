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
        <div className="h-10 w-10 rounded-full bg-[var(--border)] flex items-center justify-center mb-4">
          <span className="text-sm text-[var(--text-tertiary)]">\u2014</span>
        </div>
        <p className="text-base font-medium text-[var(--text-primary)]">No orders yet</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Orders will appear here once created.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--table-border)] text-left text-caption text-[var(--text-tertiary)]">
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium text-right">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Risk</th>
            <th className="px-4 py-3 font-medium">Trust</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium">Delivery</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-[var(--table-border)] last:border-b-0 hover:bg-[var(--table-row-hover)] transition-colors"
            >
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-[var(--text-primary)]">{order.customer.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{order.customer.phone}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{order.customer.wilaya}</p>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--text-primary)] max-w-[160px] truncate">{order.product}</td>
              <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)] whitespace-nowrap">{order.amount.toFixed(3)} TND</td>
              <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium ${RISK_META[order.riskLevel].color}`}>
                  {order.riskLevel.charAt(0).toUpperCase() + order.riskLevel.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3"><TrustScoreMeter score={order.trustScore} /></td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium ${PAYMENT_META[order.paymentStatus]?.color ?? "text-[var(--text-tertiary)]"}`}>
                  {PAYMENT_META[order.paymentStatus]?.label ?? order.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium ${DELIVERY_META[order.deliveryState]?.color ?? "text-[var(--text-tertiary)]"}`}>
                  {DELIVERY_META[order.deliveryState]?.label ?? order.deliveryState}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-[var(--table-border)] px-4 py-2 text-[10px] text-[var(--text-tertiary)]">
        {totalCount} order{totalCount !== 1 ? "s" : ""}
      </div>
    </div>
  )
}

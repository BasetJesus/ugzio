"use client"

import type { OrderTableItem } from "@/types/order"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import TrustScoreMeter from "@/components/orders/TrustScoreMeter"
import { RISK_META } from "@/lib/risk/config"

const PAYMENT_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-yellow-400" },
  confirmed: { label: "Paid", color: "text-green-400" },
  failed: { label: "Failed", color: "text-red-400" },
  refunded: { label: "Refunded", color: "text-zinc-400" },
}

const DELIVERY_META: Record<string, { label: string; color: string }> = {
  on_time: { label: "On Time", color: "text-green-400" },
  delayed: { label: "Delayed", color: "text-yellow-400" },
  at_risk: { label: "At Risk", color: "text-red-400" },
  delivered: { label: "Delivered", color: "text-green-400" },
  returned: { label: "Returned", color: "text-red-400" },
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
        <h3 className="mt-4 text-lg font-semibold text-zinc-300">No orders yet</h3>
        <p className="mt-1 text-sm text-zinc-500">Orders will appear here once created.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800/40 text-left text-xs uppercase text-zinc-500">
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
              className={`border-b border-zinc-800/20 border-l-2 ${RISK_META[order.riskLevel].border}`}
            >
              <td className="py-3 pr-4">
                <p className="font-semibold text-zinc-200">{order.customer.name}</p>
                <p className="text-xs text-zinc-500">{order.customer.phone}</p>
                <p className="text-xs text-zinc-600">{order.customer.wilaya}</p>
              </td>
              <td className="py-3 pr-4 text-zinc-300 max-w-[160px] truncate">{order.product}</td>
              <td className="py-3 pr-4 text-right font-medium text-green-400 whitespace-nowrap">{order.amount.toFixed(3)} TND</td>
              <td className="py-3 pr-4"><OrderStatusBadge status={order.status} /></td>
              <td className="py-3 pr-4">
                <span className={`text-xs font-semibold ${RISK_META[order.riskLevel].color}`}>
                  {order.riskLevel.toUpperCase()}
                </span>
              </td>
              <td className="py-3 pr-4"><TrustScoreMeter score={order.trustScore} /></td>
              <td className="py-3 pr-4">
                <span className={`text-xs font-semibold ${PAYMENT_META[order.paymentStatus]?.color ?? "text-zinc-500"}`}>
                  {PAYMENT_META[order.paymentStatus]?.label ?? order.paymentStatus}
                </span>
              </td>
              <td className="py-3">
                <span className={`text-xs font-semibold ${DELIVERY_META[order.deliveryState]?.color ?? "text-zinc-500"}`}>
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

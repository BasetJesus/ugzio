"use client"

import { useEffect } from "react"
import type { OrderTableItem } from "@/types/order"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import RiskScoreIndicator from "@/components/orders/RiskScoreIndicator"
import StatusTransitionButtons from "@/components/orders/StatusTransitionButtons"

const PAYMENT_LABEL: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", failed: "Failed", refunded: "Refunded",
}
const DELIVERY_LABEL: Record<string, string> = {
  on_time: "On Time", delayed: "Delayed", at_risk: "At Risk", delivered: "Delivered", returned: "Returned",
}

interface Props {
  order: OrderTableItem | null
  onClose: () => void
}

export default function OrderDetailsDrawer({ order, onClose }: Props) {
  useEffect(() => {
    if (order) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [order])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  if (!order) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-zinc-950 border-l border-zinc-800 shadow-2xl overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-100">Order Details</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">&times;</button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Order ID</p>
              <p className="text-xs text-zinc-600 font-mono">{order.id}</p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300">Customer</h3>
            <p className="text-zinc-100 font-semibold">{order.customer.name}</p>
            <p className="text-sm text-zinc-500">{order.customer.phone}</p>
            {order.customer.wilaya && <p className="text-sm text-zinc-600">{order.customer.wilaya}</p>}
          </div>

          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-zinc-300">Order Info</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-zinc-500">Product</p>
                <p className="text-zinc-200">{order.product ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Amount</p>
                <p className="text-green-400 font-semibold">{order.amount.toFixed(3)} TND</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Payment</p>
                <p className="text-zinc-200">{PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Delivery</p>
                <p className="text-zinc-200">{DELIVERY_LABEL[order.deliveryState] ?? order.deliveryState}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-zinc-500">Created</p>
                <p className="text-zinc-200">{new Date(order.createdAt).toLocaleDateString("fr-TN", { dateStyle: "long" })}</p>
              </div>
            </div>
          </div>

          <RiskScoreIndicator riskLevel={order.riskLevel} trustScore={order.trustScore} />

          <StatusTransitionButtons orderId={order.id} currentStatus={order.status} />
        </div>
      </div>
    </>
  )
}

"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

const STATUS_ACTIONS: Record<string, { label: string; nextStatus: string; variant: "primary" | "danger" | "success" }[]> = {
  CREATED: [{ label: "Send Confirm", nextStatus: "PRE_SHIPPING_CONFIRM_SENT", variant: "primary" }],
  BUYER_CONFIRMED: [
    { label: "Mark Shipped", nextStatus: "SHIPPED", variant: "success" },
    { label: "Cancel Order", nextStatus: "INTELLIGENT_CANCEL", variant: "danger" },
  ],
  SHIPPED: [
    { label: "Mark Delivered", nextStatus: "DELIVERED", variant: "success" },
    { label: "Mark Refused", nextStatus: "REFUSED", variant: "danger" },
  ],
  PENDING_RESCHEDULE: [
    { label: "Resend Confirm", nextStatus: "PRE_SHIPPING_CONFIRM_SENT", variant: "primary" },
    { label: "Cancel Order", nextStatus: "INTELLIGENT_CANCEL", variant: "danger" },
  ],
}

const VARIANTS = {
  primary: "bg-green-600 hover:bg-green-500 text-white",
  danger: "bg-red-950/50 hover:bg-red-900/50 text-red-400 border border-red-900/30",
  success: "bg-green-600 hover:bg-green-500 text-white",
}

export default function StatusTransitionButtons({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  const actions = STATUS_ACTIONS[currentStatus]

  if (!actions || actions.length === 0) return null

  async function handleTransition(nextStatus: string) {
    setLoading(nextStatus)
    setError("")
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Transition failed")
        return
      }
      router.refresh()
    } catch {
      setError("Network error")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.nextStatus}
            onClick={() => handleTransition(action.nextStatus)}
            disabled={loading !== null}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${VARIANTS[action.variant]}`}
          >
            {loading === action.nextStatus ? "..." : action.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  )
}

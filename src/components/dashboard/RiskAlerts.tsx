"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  if (orders.length === 0) return null

  async function handleSendConfirm(orderId: string) {
    setSendingId(orderId)
    setError("")
    try {
      const res = await fetch("/api/v1/zioconfirm/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Erreur")
        return
      }
      router.refresh()
    } catch {
      setError("Erreur réseau")
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="border border-[var(--kpi-red-border)] rounded-lg p-4 space-y-3 bg-[var(--kpi-red-bg)]">
      <h2 className="text-sm font-semibold text-[var(--risk-red)]">🔴 High Risk Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[var(--text-primary)]">{order.buyerName}</p>
            <p className="text-xs text-[var(--text-secondary)]">{order.buyerPhone}</p>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">{Number(order.amount).toFixed(3)} TND · Score {order.trustScore}/100</p>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => handleSendConfirm(order.id)}
              disabled={sendingId !== null}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {sendingId === order.id ? "..." : "Send WhatsApp Confirm"}
            </button>
          </div>
        </div>
      ))}
      {error && (
        <div className="rounded-md border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
          {error}
        </div>
      )}
    </div>
  )
}

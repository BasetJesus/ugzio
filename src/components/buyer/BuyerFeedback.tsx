"use client"

import { useState } from "react"
import { trackFeedback } from "@/lib/analytics"
import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

const EMOJIS = [
  { value: 5, emoji: "😍", label: "Excellente" },
  { value: 4, emoji: "🙂", label: "Bonne" },
  { value: 3, emoji: "😐", label: "Moyenne" },
  { value: 2, emoji: "😕", label: "Pas top" },
  { value: 1, emoji: "😤", label: "Mauvaise" },
]

export default function BuyerFeedback({ order }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [note, setNote] = useState("")

  if (order.phase !== "delivered" && order.phase !== "completed") return null
  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center animate-scale-in">
        <p className="text-sm font-medium text-[var(--success-green)]">Merci pour votre avis ! 🙏</p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Votre retour aide les autres acheteurs</p>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!selected) return
    try {
      await fetch("/api/buyer/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: order.token, satisfaction: selected, note }),
      })
      trackFeedback(order.orderId, selected, { note: note || null })
      setSubmitted(true)
    } catch {
      trackFeedback(order.orderId, selected, { note: note || null, error: "true" })
      setSubmitted(true)
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
        Comment s&apos;est passée votre expérience ?
      </p>
      <div className="flex items-center justify-between gap-1">
        {EMOJIS.map((e) => (
          <button
            key={e.value}
            onClick={() => setSelected(e.value)}
            className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all duration-150 ${
              selected === e.value
                ? "bg-[var(--accent)]/20 ring-1 ring-[var(--accent)]/40 scale-105"
                : "hover:bg-[var(--bg-surface)] active:scale-95"
            }`}
          >
            <span className="text-xl">{e.emoji}</span>
            <span className="text-[9px] text-[var(--text-tertiary)]">{e.label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-3 space-y-2 animate-fade-in-up">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Un commentaire ? (optionnel)"
            rows={2}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none focus:border-[var(--accent)]/50"
          />
          <button
            onClick={handleSubmit}
            className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-2.5 px-4 text-center text-xs font-medium text-white transition-all duration-150 active:scale-[0.98]"
          >
            Envoyer mon avis
          </button>
        </div>
      )}
    </div>
  )
}

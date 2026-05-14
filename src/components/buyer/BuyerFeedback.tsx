"use client"

import { useState } from "react"
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
        <p className="text-sm font-medium text-emerald-400">Merci pour votre avis ! 🙏</p>
        <p className="text-xs text-zinc-500 mt-1">Votre retour aide les autres acheteurs</p>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!selected) return
    try {
      await fetch("/api/buyer/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId, satisfaction: selected, note }),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <p className="text-sm font-medium text-white mb-3">
        Comment s&apos;est passée votre expérience ?
      </p>
      <div className="flex items-center justify-between gap-1">
        {EMOJIS.map((e) => (
          <button
            key={e.value}
            onClick={() => setSelected(e.value)}
            className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all duration-150 ${
              selected === e.value
                ? "bg-purple-500/20 ring-1 ring-purple-500/40 scale-105"
                : "hover:bg-zinc-800/50 active:scale-95"
            }`}
          >
            <span className="text-xl">{e.emoji}</span>
            <span className="text-[9px] text-zinc-500">{e.label}</span>
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
            className="w-full rounded-xl border border-[var(--border)] bg-zinc-900/50 p-3 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-purple-500/50"
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

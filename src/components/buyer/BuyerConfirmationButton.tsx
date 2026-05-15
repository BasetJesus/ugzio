"use client"

import { useState, useCallback } from "react"
import { trackConfirmation, trackWhatsAppClick } from "@/lib/analytics"
import type { BuyerAction } from "@/services/buyer-order.service"

interface Props {
  orderId: string
}

export default function BuyerConfirmationButton({ orderId }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "confirmed" | "error">("idle")
  const [showQuestionField, setShowQuestionField] = useState(false)
  const [question, setQuestion] = useState("")

  const handleConfirm = useCallback(async () => {
    setStatus("loading")
    try {
      const res = await fetch("/api/buyer/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "confirm" }),
      })
      if (!res.ok) throw new Error("failed")
      setStatus("confirmed")
      trackConfirmation(orderId, { method: "button_click" })
    } catch {
      setStatus("error")
    }
  }, [orderId])

  const handleQuestion = useCallback(async () => {
    trackWhatsAppClick("buyer_question", { orderId, hasQuestion: !!question.trim() })
    if (!question.trim()) {
      window.open(`https://wa.me/?text=${encodeURIComponent("J'ai une question sur ma commande")}`, "_blank")
      return
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(question)}`, "_blank")
  }, [question, orderId])

  if (status === "confirmed") {
    return (
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 to-emerald-500/5 p-6 text-center animate-scale-in">
        <div className="absolute -top-4 -right-4 text-4xl opacity-30 animate-pulse">✨</div>
        <div className="absolute -bottom-2 -left-2 text-3xl opacity-20 animate-bounce">🎊</div>
        <div className="relative z-10">
          <div className="text-4xl mb-3 animate-bounce">🎉</div>
          <h2 className="text-lg font-bold text-emerald-400 mb-1">
            Commande confirmée avec succès !
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Le vendeur a été notifié et va préparer votre colis inchallah
          </p>
          <div className="mt-4 flex items-center justify-center gap-1">
            <span className="text-xs text-[var(--text-tertiary)]">Transaction sécurisée par</span>
            <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              UGZIO ✓
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleConfirm}
        disabled={status === "loading"}
        className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed py-4 px-6 text-center transition-all duration-150"
      >
        {status === "loading" ? (
          <span className="text-sm font-semibold text-white">Un instant...</span>
        ) : (
          <>
            <span className="text-sm font-semibold text-white">✅ Confirmer ma commande</span>
            <p className="text-[10px] text-purple-300/70 mt-0.5">
              Je confirme que je vais recevoir ma commande
            </p>
          </>
        )}
      </button>

      {!showQuestionField ? (
        <button
          onClick={() => setShowQuestionField(true)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-3 px-4 text-center transition-all duration-150 hover:bg-[var(--bg-surface)]"
        >
          <span className="text-xs text-[var(--text-secondary)]">❓ J&apos;ai une question</span>
        </button>
      ) : (
        <div className="space-y-2 animate-fade-in-up">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Posez votre question ici..."
            rows={2}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none focus:border-[var(--accent)]/50"
          />
          <button
            onClick={handleQuestion}
            className="w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2.5 px-4 text-center transition-all duration-150 hover:bg-indigo-500/20"
          >
            <span className="text-xs font-medium text-indigo-400">Envoyer sur WhatsApp →</span>
          </button>
        </div>
      )}

      {status === "error" && (
        <p className="text-xs text-red-400 text-center">
          Une erreur est survenue. Veuillez réessayer.
        </p>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { trackReferralClick, trackWhatsAppClick } from "@/lib/analytics"
import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
  referralCode: string | null
}

export default function BuyerReferralPrompt({ order, referralCode }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (order.phase !== "delivered" && order.phase !== "completed") return null
  if (dismissed) return null

  const rewardMessage = `Salem! J'ai commandé chez ${order.sellerName} et tout s'est bien passé ✅ Livraison rapide et produit de qualité. Recommandé!${referralCode ? `\n\nMon code: ${referralCode}` : ""}`

  const handleShare = () => {
    trackReferralClick(order.orderId, { method: "whatsapp_share", hasCode: !!referralCode })
    trackWhatsAppClick("referral_share", { orderId: order.orderId, referralCode })
    window.open(`https://wa.me/?text=${encodeURIComponent(rewardMessage)}`, "_blank")
    setDismissed(true)
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent p-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
          <span className="text-sm">🤝</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">T7eb t3awen sa7bek ?</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            Partage cette expérience avec un ami qui vend aussi en ligne.
            Gagne <span className="text-amber-400 font-medium">5 TND</span> sur ta prochaine commande quand il s&apos;inscrit avec ton code.
          </p>

          {referralCode && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className="flex-1 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 px-3 py-2 text-center"
              >
                <span className="text-xs text-[var(--text-secondary)]">Ton code</span>
                <p className="text-sm font-mono font-bold text-amber-400 tracking-wider select-all">{referralCode}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleShare}
              className="flex-1 rounded-lg bg-amber-600 hover:bg-amber-500 py-2.5 px-4 text-center text-xs font-medium text-white transition-all duration-150 active:scale-[0.98]"
            >
              🤝 Partager sur WhatsApp
            </button>
            <button
              onClick={() => {
                trackReferralClick(order.orderId, { method: "dismiss", hasCode: !!referralCode })
                setDismissed(true)
              }}
              className="rounded-lg border border-[var(--border)] py-2.5 px-3 text-center text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Pas maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

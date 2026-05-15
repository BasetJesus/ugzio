"use client"

import { useState } from "react"
import { trackUGCTrigger, trackWhatsAppClick } from "@/lib/analytics"
import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

export default function BuyerUGCPrompt({ order }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (order.phase !== "delivered" && order.phase !== "completed") return null
  if (dismissed) return null

  const ugcMessage = `Salem ${order.buyerName}!, J'ai reçu ma commande ${order.product ? `de ${order.product} ` : ""}et je confirme que tout va bien ✅`

  const handleWhatsApp = () => {
    trackUGCTrigger(order.orderId, { method: "whatsapp_photo" })
    trackWhatsAppClick("ugc_photo_share", { orderId: order.orderId })
    window.open(
      `https://wa.me/?text=${encodeURIComponent(ugcMessage)}`,
      "_blank",
    )
    setDismissed(true)
  }

  return (
    <div className="rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent p-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
          <span className="text-sm">📸</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">T7eb tsa3edna ?</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            Envoie-nous une photo de ton produit sur WhatsApp et gagne 15 TND
            de crédit pour ta prochaine commande 🎁
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleWhatsApp}
              className="flex-1 rounded-lg bg-green-600 hover:bg-green-500 py-2.5 px-4 text-center text-xs font-medium text-white transition-all duration-150 active:scale-[0.98]"
            >
              📸 Envoyer une photo
            </button>
            <button
              onClick={() => {
                trackUGCTrigger(order.orderId, { method: "dismiss" })
                setDismissed(true)
              }}
              className="rounded-lg border border-[var(--border)] py-2.5 px-3 text-center text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

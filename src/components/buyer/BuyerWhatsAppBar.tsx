"use client"

import { trackWhatsAppClick } from "@/lib/analytics"
import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

export default function BuyerWhatsAppBar({ order }: Props) {
  const handleContact = () => {
    trackWhatsAppClick("help_bar", { orderId: order.orderId })
    const phone = order.sellerPhone?.replace(/\s/g, "") || ""
    const text = encodeURIComponent(`Salem, j'ai une question sur ma commande ${order.orderId.slice(0, 8)}`)
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank")
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
          <span className="text-sm">💬</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">Besoin d&apos;aide ?</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Contactez-nous directement sur WhatsApp
          </p>
        </div>
        <button
          onClick={handleContact}
          className="shrink-0 rounded-lg bg-green-600 hover:bg-green-500 py-2 px-3 text-xs font-medium text-white transition-all duration-150 active:scale-[0.98]"
        >
          WhatsApp →
        </button>
      </div>
    </div>
  )
}

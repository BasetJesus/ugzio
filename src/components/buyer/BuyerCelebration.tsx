"use client"

import { useEffect, useState } from "react"
import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

export default function BuyerCelebration({ order }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 600)
    return () => clearTimeout(t)
  }, [])

  if (order.phase !== "delivered" && order.phase !== "completed") return null
  if (!show) return null

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-6 text-center animate-scale-in">
      <div className="relative mb-4">
        <div className="text-5xl animate-bounce">🎉</div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
      </div>
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
        {order.sellerName} vous remercie ! 🙏
      </h2>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        Votre commande est arrivée. On espère que vous l&apos;aimez autant qu&apos;on a aimé vous servir.
      </p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
          ✅ Livraison confirmée
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1.5 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
          🛡️ Protégé par UGZIO
        </span>
      </div>
    </div>
  )
}

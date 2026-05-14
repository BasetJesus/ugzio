"use client"

import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

export default function BuyerCelebration({ order }: Props) {
  if (order.phase !== "delivered" && order.phase !== "completed") return null

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-6 text-center animate-scale-in">
      <div className="text-4xl mb-3 animate-bounce">🎉</div>
      <h2 className="text-lg font-bold text-white mb-1">
        Commande livrée avec succès !
      </h2>
      <p className="text-sm text-zinc-400 leading-relaxed">
        Nchallah t7ebha w tferhat biha 🎊
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-[10px] text-zinc-500">Livraison vérifiée par</span>
        <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
          UGZIO ✓
        </span>
      </div>
    </div>
  )
}

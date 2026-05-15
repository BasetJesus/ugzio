"use client"

import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

const PHASE_CONFIG = {
  pre_confirmation: {
    icon: "🛡️",
    title: "Commande sécurisée",
    subtitle: "Votre commande est enregistrée chez un vendeur vérifié",
    gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
  },
  confirmed: {
    icon: "✅",
    title: "Commande confirmée",
    subtitle: "Tawa commandtek tejhed, on s'occupe de tout",
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
  },
  shipped: {
    icon: "📦",
    title: "Commande en route",
    subtitle: "Votre colis est en chemin vers vous",
    gradient: "from-blue-500/20 via-sky-500/10 to-transparent",
  },
  delivered: {
    icon: "🎉",
    title: "Commande livrée !",
    subtitle: "Votre commande est arrivée. Nchallah t7ebha",
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
  },
  completed: {
    icon: "⭐",
    title: "Merci pour votre confiance",
    subtitle: "On espère que vous avez aimé votre expérience",
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
  },
}

export default function BuyerHero({ order }: Props) {
  const cfg = PHASE_CONFIG[order.phase]

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${cfg.gradient} p-6 pb-8`}
    >
      <div className="relative z-10">
        <div className="text-3xl mb-3">{cfg.icon}</div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight mb-1 text-balance">
          {cfg.title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {cfg.subtitle}
        </p>
      </div>
    </div>
  )
}

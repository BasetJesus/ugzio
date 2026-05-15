"use client"

import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

const PHASE_CONFIG = {
  pre_confirmation: {
    icon: "🛡️",
    title: "Mabrouk! Commander mte3ek mahmia",
    subtitle: "Votre commande est protégée et suivie par UGZIO",
    gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
    celebration: true,
  },
  confirmed: {
    icon: "✅",
    title: "Commande confirmée",
    subtitle: "Tawa commandtek tejhed, on s'occupe de tout",
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
    celebration: false,
  },
  shipped: {
    icon: "📦",
    title: "Commande en route",
    subtitle: "Votre colis est en chemin vers vous",
    gradient: "from-blue-500/20 via-sky-500/10 to-transparent",
    celebration: false,
  },
  delivered: {
    icon: "🎉",
    title: "Commande livrée !",
    subtitle: "Votre commande est arrivée. Nchallah t7ebha",
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
    celebration: false,
  },
  completed: {
    icon: "⭐",
    title: "Merci pour votre confiance",
    subtitle: "On espère que vous avez aimé votre expérience",
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    celebration: false,
  },
}

function SocialIcon({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-sm hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30 transition-colors"
      title={label}
    >
      {label === "Instagram" && "📸"}
      {label === "Facebook" && "👍"}
      {label === "TikTok" && "🎵"}
    </a>
  )
}

export default function BuyerHero({ order }: Props) {
  const cfg = PHASE_CONFIG[order.phase]

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${cfg.gradient} p-6 pb-8 ${cfg.celebration ? "animate-trust-glow" : ""}`}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`text-3xl ${cfg.celebration ? "animate-heartbeat" : ""}`}>{cfg.icon}</div>
          {order.socialLinks && Object.values(order.socialLinks).some(Boolean) && (
            <div className="flex items-center gap-1.5">
              {order.socialLinks.instagram && (
                <SocialIcon url={order.socialLinks.instagram} label="Instagram" />
              )}
              {order.socialLinks.facebook && (
                <SocialIcon url={order.socialLinks.facebook} label="Facebook" />
              )}
              {order.socialLinks.tiktok && (
                <SocialIcon url={order.socialLinks.tiktok} label="TikTok" />
              )}
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight mb-1 text-balance">
          {order.sellerName}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {order.brandDescription || cfg.subtitle}
        </p>
        {cfg.celebration && (
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
              🔒 Commandé et protégé
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
              ✓ UGZIO
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

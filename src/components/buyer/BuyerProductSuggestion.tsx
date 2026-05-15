"use client"

import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

type Suggestion = {
  name: string
  price: string
  emoji: string
}

function getSuggestions(product: string | null): Suggestion[] {
  const p = (product ?? "").toLowerCase()

  if (p.includes("tv") || p.includes("samsung") || p.includes("écran") || p.includes("télé")) {
    return [
      { name: "Support mural universel", price: "35 TND", emoji: "🖥️" },
      { name: "Câble HDMI 4K 2m", price: "15 TND", emoji: "🔌" },
    ]
  }

  if (p.includes("smartphone") || p.includes("téléphone") || p.includes("iphone") || p.includes("xiaomi") || p.includes("samsung") && !p.includes("tv")) {
    return [
      { name: "Coque de protection", price: "25 TND", emoji: "📱" },
      { name: "Chargeur rapide 33W", price: "20 TND", emoji: "⚡" },
    ]
  }

  if (p.includes("écouteur") || p.includes("casque") || p.includes("airpods") || p.includes("bluetooth")) {
    return [
      { name: "Adaptateur Bluetooth", price: "18 TND", emoji: "📡" },
      { name: "Écouteurs de rechange", price: "30 TND", emoji: "🎧" },
    ]
  }

  if (p.includes("robe") || p.includes("sac") || p.includes("mode") || p.includes("vêtement")) {
    return [
      { name: "Ceinture assortie", price: "22 TND", emoji: "👗" },
      { name: "Écharpe en soie", price: "18 TND", emoji: "🧣" },
    ]
  }

  if (p.includes("maillot") || p.includes("sport") || p.includes("chaussure") || p.includes("running")) {
    return [
      { name: "Serviette de sport", price: "15 TND", emoji: "🏋️" },
      { name: "Gourde isotherme", price: "20 TND", emoji: "🫗" },
    ]
  }

  if (p.includes("montre") || p.includes("parfum") || p.includes("accessoir")) {
    return [
      { name: "Coffret cadeau", price: "12 TND", emoji: "🎁" },
      { name: "Carte de rechargement", price: "10 TND", emoji: "💳" },
    ]
  }

  return [
    { name: "Bon d'achat 20 TND", price: "20 TND", emoji: "🎫" },
    { name: "Carte cadeau", price: "50 TND", emoji: "🎁" },
  ]
}

export default function BuyerProductSuggestion({ order }: Props) {
  if (order.phase !== "pre_confirmation" && order.phase !== "confirmed") return null

  const suggestions = getSuggestions(order.product)

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">💡</span>
        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          Recommandé pour vous
        </p>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{s.emoji}</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{s.name}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">Prix indicatif</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[var(--accent)]">{s.price}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-[var(--text-tertiary)] text-center">
        Contacte le vendeur pour commander ces articles
      </p>
    </div>
  )
}

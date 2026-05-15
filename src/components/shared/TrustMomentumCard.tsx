"use client"

import type { SellerStyle } from "@/services/seller-context.service"

interface TrustMomentumData {
  trustImprovement: number
  confirmedOrders: number
  successfulDeliveries: number
  ugcRequestsTriggered: number
  bestSequence: string
  buyerSatisfactionScore: number
}

interface Props {
  data: TrustMomentumData
  sellerStyle?: SellerStyle
}

function trustNarrative(data: TrustMomentumData, style?: SellerStyle): string {
  if (data.trustImprovement > 0) {
    if (style === "relationship_seller") return `${data.trustImprovement}% d'amélioration — vos acheteurs vous font confiance`
    if (style === "fast_responder") return `${data.trustImprovement}% d'amélioration — les confirmations rapides renforcent la confiance`
    return `${data.trustImprovement}% d'amélioration des signaux de confiance acheteurs`
  }
  if (data.confirmedOrders > 5) return "La confiance se construit par des confirmations régulières"
  return "Construction de la base de confiance"
}

export default function TrustMomentumCard({ data, sellerStyle }: Props) {
  const hasData = data.confirmedOrders > 0 || data.successfulDeliveries > 0

  if (!hasData) return null

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <p className="text-caption text-[var(--text-tertiary)]">Momentum de confiance</p>
        <h2 className="text-display text-[var(--text-primary)] mt-1">
          Confiance acheteur
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {trustNarrative(data, sellerStyle)}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-panel p-panel">
        <div>
          <p className="text-caption text-[var(--success-green)]">Commandes confirmées</p>
          <p className="text-display text-[var(--text-primary)] mt-0.5">
            {data.confirmedOrders}
          </p>
        </div>

        <div>
          <p className="text-caption text-[var(--accent)]">Meilleure séquence</p>
          <p className="text-display text-[var(--text-primary)] mt-0.5">
            {data.bestSequence}
          </p>
        </div>

        <div>
          <p className="text-caption text-[var(--psych-reassurance)]">Demandes UGC</p>
          <p className="text-display text-[var(--text-primary)] mt-0.5">
            {data.ugcRequestsTriggered}
          </p>
        </div>

        <div>
          <p className="text-caption text-[var(--text-tertiary)]">Satisfaction</p>
          <p className={"text-display mt-0.5 " + (data.buyerSatisfactionScore >= 70 ? "text-[var(--success-green)]" : data.buyerSatisfactionScore >= 40 ? "text-[var(--warning-amber)]" : "text-[var(--risk-red)]")}>
            {data.buyerSatisfactionScore + "%"}
          </p>
        </div>
      </div>
    </div>
  )
}

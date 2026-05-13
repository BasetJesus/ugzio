"use client"

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
}

export default function TrustMomentumCard({ data }: Props) {
  const hasData = data.confirmedOrders > 0 || data.successfulDeliveries > 0

  if (!hasData) return null

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <p className="text-caption text-[var(--text-tertiary)]">Trust Momentum</p>
        <h2 className="text-display text-[var(--text-primary)] mt-1">
          Buyer Trust
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {data.trustImprovement > 0
            ? data.trustImprovement + "% improvement in buyer trust signals"
            : "Building trust baseline"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-panel p-panel">
        <div>
          <p className="text-caption text-[var(--success-green)]">Confirmed Orders</p>
          <p className="text-display text-[var(--text-primary)] mt-0.5">
            {data.confirmedOrders}
          </p>
        </div>

        <div>
          <p className="text-caption text-[var(--accent)]">Best Sequence</p>
          <p className="text-display text-[var(--text-primary)] mt-0.5">
            {data.bestSequence}
          </p>
        </div>

        <div>
          <p className="text-caption text-[var(--psych-reassurance)]">UGC Requests</p>
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

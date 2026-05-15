interface Props {
  sellerName: string
  trustScore: number
}

export default function BuyerTrustBadge({ sellerName, trustScore }: Props) {
  const isVerified = trustScore >= 40
  const isHighTrust = trustScore >= 70

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10">
        <span className="text-lg">{isHighTrust ? "🛡️" : "✓"}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
          {isVerified ? `${sellerName} — Vendeur vérifié` : sellerName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isHighTrust && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              ✓ Confiance élevée
            </span>
          )}
          {isVerified && !isHighTrust && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
              ✓ Vérifié UGZIO
            </span>
          )}
          {!isVerified && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[var(--text-tertiary)] bg-[var(--bg-card)] px-1.5 py-0.5 rounded-full">
              Nouveau vendeur
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

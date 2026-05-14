interface Props {
  estimatedDays: number
  phase: string
}

export default function BuyerDeliveryExpectation({ estimatedDays, phase }: Props) {
  if (phase === "delivered" || phase === "completed") return null

  const minDays = Math.max(1, estimatedDays - 1)
  const maxDays = estimatedDays + 1

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10">
          <span className="text-sm">📅</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Livraison estimée</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sous {minDays} à {maxDays} jours ouvrés
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">
            Vous serez notifié par WhatsApp avant la livraison
          </p>
        </div>
      </div>
    </div>
  )
}

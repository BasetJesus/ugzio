"use client"

import type { SellerContext } from "@/services/seller-context.service"

interface Props {
  context: SellerContext
}

export default function SellerBusinessProfileCard({ context }: Props) {
  const { profile, rhythm, style } = context
  const hasData = profile.averageOrderValue > 0

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-all duration-300">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: style.accent, boxShadow: `0 0 6px ${style.accent}40` }}
          />
          <p className="text-caption" style={{ color: style.accent }}>{style.label}</p>
        </div>
        <h2 className="text-display text-[var(--text-primary)] mt-1">Votre exploitation</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">{profile.businessRhythm}</p>
      </div>

      <div className="p-panel space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-[var(--bg-surface)] p-3">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Commande moyenne</p>
            <p className="text-base font-semibold text-[var(--text-primary)] mt-0.5">
              {hasData ? `${profile.averageOrderValue} TND` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--bg-surface)] p-3">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Réponse acheteur</p>
            <p className="text-base font-semibold mt-0.5" style={{ color: profile.buyerResponsiveness >= 50 ? "var(--state-protected)" : profile.buyerResponsiveness > 0 ? "var(--state-recovering)" : "var(--text-tertiary)" }}>
              {profile.buyerResponsiveness > 0 ? `${profile.buyerResponsiveness}%` : "—"}
            </p>
          </div>
        </div>

        {hasData && (
          <div className="rounded-lg bg-[var(--bg-surface)] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-tertiary)]">Heure de pointe</span>
              <span className="text-[11px] font-medium text-[var(--text-primary)]">
                {rhythm.peakPeriodLabel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-tertiary)]">Comportement acheteur</span>
              <span className="text-[11px] font-medium text-[var(--text-primary)]">
                {profile.confirmationBehavior}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-tertiary)]">Meilleure séquence</span>
              <span className="text-[11px] font-medium text-[var(--text-primary)]" style={{ color: style.accent }}>
                {rhythm.strongestSequence}
              </span>
            </div>
            {rhythm.repeatBuyerStability > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-tertiary)]">Acheteurs récurrents</span>
                <span className={"text-[11px] font-medium " + (rhythm.repeatBuyerStability >= 30 ? "text-[var(--state-protected)]" : "text-[var(--text-primary)]")}>
                  {rhythm.repeatBuyerStability}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

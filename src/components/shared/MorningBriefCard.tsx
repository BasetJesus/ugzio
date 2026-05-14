"use client"

import type { SellerContext } from "@/services/seller-context.service"
import Link from "next/link"

interface Props {
  context: SellerContext
  revenueAtRisk: number
  needsAction: number
}

export default function MorningBriefCard({ context, revenueAtRisk, needsAction }: Props) {
  const { profile, rhythm, style, continuity, narrative } = context
  const hasData = profile.averageOrderValue > 0
  const hasRisk = revenueAtRisk > 0 || needsAction > 0

  let attentionLabel: string | null = null
  if (needsAction > 0 && revenueAtRisk > 200) attentionLabel = `${revenueAtRisk.toFixed(0)} TND exposed — ${needsAction} orders need attention`
  else if (needsAction > 0) attentionLabel = `${needsAction} orders waiting for confirmation`
  else if (revenueAtRisk > 200) attentionLabel = `${revenueAtRisk.toFixed(0)} TND currently exposed`

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 rounded-full animate-breathe" style={{ backgroundColor: style.accent, boxShadow: `0 0 6px ${style.accent}40` }} />
          <p className="text-caption" style={{ color: style.accent }}>{style.label}</p>
        </div>
        <h2 className="text-display text-[var(--text-primary)] mt-1">Morning Brief</h2>
      </div>

      <div className="p-panel space-y-3">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          {narrative}
        </p>

        {hasRisk && (
          <div className="rounded-lg bg-[var(--kpi-red-bg)] border border-[var(--kpi-red-border)] p-3">
            <div className="flex items-start gap-2">
              <span className="text-xs mt-0.5 shrink-0">{needsAction > 0 ? "⚠️" : "🛡️"}</span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--risk-red)]">{attentionLabel}</p>
                {needsAction > 0 && (
                  <Link href="/confirm" className="text-[10px] text-[var(--accent)] hover:underline mt-1 inline-block">
                    Open confirmation queue
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {hasData && rhythm.confirmationSpeedTrend !== "stable" && (
          <div className="flex items-center gap-2">
            <span className="text-xs">{rhythm.confirmationSpeedTrend === "improving" ? "↑" : "↓"}</span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Confirmations {rhythm.confirmationSpeedTrend === "improving" ? "speeding up" : "slowing down"}
            </span>
          </div>
        )}

        {continuity.length > 0 && (
          <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Trending</p>
            {continuity.map((msg, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs">{msg.positive ? "↑" : "↓"}</span>
                <span className={"text-[11px] " + (msg.positive ? "text-[var(--text-primary)]" : "text-[var(--state-recovering)]")}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {rhythm.highRiskPeriods.length > 0 && (
          <div className="pt-2 border-t border-[var(--border)]">
            <div className="flex items-start gap-2">
              <span className="text-xs mt-0.5 shrink-0">📅</span>
              <div>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Watch periods</p>
                {rhythm.highRiskPeriods.slice(0, 2).map((p, i) => (
                  <p key={i} className="text-[11px] text-[var(--state-recovering)]">{p}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

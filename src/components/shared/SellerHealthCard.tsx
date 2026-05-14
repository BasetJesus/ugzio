"use client"

import type { SellerHealth } from "@/services/pilot.service"
import type { SellerStyle } from "@/services/seller-context.service"

interface Props {
  data: SellerHealth | null
  sellerStyle?: SellerStyle
}

const STYLE_TONES: Record<string, string> = {
  stable_operator: "Consistent, reliable operation",
  fast_responder: "Quick response rhythm",
  high_risk_defender: "Risk-aware operation",
  momentum_builder: "Growing operational momentum",
  relationship_seller: "Buyer-focused operation",
}

const STABILITY_STATES: Record<string, { label: string; state: "stable" | "focused" | "urgent"; color: string }> = {
  stable: { label: "Stable", state: "stable", color: "var(--state-stable)" },
  attention: { label: "Needs attention", state: "focused", color: "var(--state-recovering)" },
  critical: { label: "Critical", state: "urgent", color: "var(--state-urgent)" },
}

const TREND_LABELS: Record<string, { label: string; color: string }> = {
  improving: { label: "Improving", color: "var(--state-protected)" },
  stable: { label: "Stable", color: "var(--text-tertiary)" },
  declining: { label: "Declining", color: "var(--state-urgent)" },
}

const STATE_DOT: Record<string, string> = {
  stable: "animate-breathe",
  focused: "animate-pulse-focused",
  urgent: "animate-pulse-urgent",
}

export default function SellerHealthCard({ data, sellerStyle }: Props) {
  if (!data || data.totalOrders === 0) return null

  const stability = STABILITY_STATES[data.operationalStability] ?? STABILITY_STATES.stable
  const trend = TREND_LABELS[data.rtsTrend] ?? TREND_LABELS.stable
  const dotAnim = STATE_DOT[stability.state] ?? ""
  const tone = sellerStyle ? STYLE_TONES[sellerStyle] : null

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-all duration-300">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <span className={`h-1.5 w-1.5 rounded-full ${dotAnim}`} style={{ backgroundColor: stability.color, boxShadow: `0 0 6px ${stability.color}40` }} />
          <p className="text-caption" style={{ color: stability.color }}>{stability.label}</p>
        </div>
        <h2 className="text-display text-[var(--text-primary)] mt-1">Operational Status</h2>
        {tone && <p className="text-xs text-[var(--text-secondary)] mt-1">{tone}</p>}
      </div>

      <div className="grid grid-cols-2 gap-panel p-panel">
        <div>
          <p className="text-caption text-[var(--text-tertiary)]">RTS Trend</p>
          <p className="text-base font-semibold mt-0.5" style={{ color: trend.color }}>
            {trend.label}
          </p>
        </div>
        <div>
          <p className="text-caption text-[var(--text-tertiary)]">Confirmed</p>
          <p className="text-base font-semibold mt-0.5 text-[var(--text-primary)]">
            {data.confirmedRate}%
          </p>
        </div>
        <div>
          <p className="text-caption text-[var(--text-tertiary)]">Delivered</p>
          <p className="text-base font-semibold mt-0.5 text-[var(--text-primary)]">
            {data.deliveredRate}%
          </p>
        </div>
        <div>
          <p className="text-caption text-[var(--text-tertiary)]">Orders</p>
          <p className="text-base font-semibold mt-0.5 text-[var(--text-primary)]">
            {data.totalOrders}
          </p>
        </div>
      </div>

      <div className="px-panel pb-panel">
        <div className="rounded-lg bg-[var(--bg-surface)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-tertiary)]">Confirmation speed</span>
            <span className="text-[11px] font-medium text-[var(--text-primary)]">
              {data.confirmationSpeed > 0 ? data.confirmationSpeed + "m avg" : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-tertiary)]">Buyer responsiveness</span>
            <span className={"text-[11px] font-medium " + (data.buyerResponsiveness >= 50 ? "text-[var(--state-protected)]" : "text-[var(--state-recovering)]")}>
              {data.buyerResponsiveness > 0 ? data.buyerResponsiveness + "%" : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-tertiary)]">Trust momentum</span>
            <span className={"text-[11px] font-medium " + (data.trustMomentum >= 70 ? "text-[var(--state-protected)]" : data.trustMomentum >= 40 ? "text-[var(--state-recovering)]" : "text-[var(--state-urgent)]")}>
              {data.trustMomentum}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

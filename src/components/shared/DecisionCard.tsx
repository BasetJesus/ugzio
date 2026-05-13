"use client"

import type { ConfirmationQueueItem } from "@/services/confirmation.service"
import type { PsychologyPreview } from "@/types/whatsapp"
import { EmotionBadge } from "@/components/shared/KpiCard"
import PsychologyCard from "@/components/shared/PsychologyCard"

interface Props {
  item: ConfirmationQueueItem
  psychology?: PsychologyPreview
  onAction: (orderId: string, action: string) => void
  onSelect?: () => void
  submitting?: string | null
  showActions?: boolean
}

function failurePct(item: ConfirmationQueueItem): number {
  if (item.riskLevel === "high") return 65 + Math.round((100 - item.trustScore) * 0.35)
  if (item.riskLevel === "medium") return 35 + Math.round((100 - item.trustScore) * 0.25)
  return Math.round((100 - item.trustScore) * 0.15)
}

function riskColor(level: string): string {
  switch (level) {
    case "high": return "text-[var(--risk-red)]"
    case "medium": return "text-[var(--warning-amber)]"
    default: return "text-[var(--success-green)]"
  }
}

function psyColor(level: string): string {
  switch (level) {
    case "high": return "var(--emotion-tension)"
    case "medium": return "var(--warning-amber-bg)"
    default: return "var(--emotion-protection)"
  }
}

const PSYCH_EMOTION = {
  trust: "calm" as const,
  reminder: "calm" as const,
  urgency: "tense" as const,
  reassurance: "protective" as const,
}

function emotionLabel(riskLevel: string): string {
  if (riskLevel === "high") return "tense"
  if (riskLevel === "medium") return "calm"
  return "protective"
}

export default function DecisionCard({ item, psychology, onAction, onSelect, submitting, showActions = true }: Props) {
  const rl = item.riskLevel
  const pct = failurePct(item)
  const sub = submitting
  const emotion = PSYCH_EMOTION[psychology?.sequenceType ?? "trust"]

  return (
    <div
      className="rounded-xl border p-4 transition-all duration-300 cursor-pointer hover:opacity-90"
      style={{
        borderColor: rl === "high" ? "var(--kpi-red-border)" : "var(--border)",
        backgroundColor: rl === "high" ? "var(--kpi-red-bg)" : "var(--bg-card)",
        boxShadow: rl === "high" ? "var(--glow-red)" : "none",
      }}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.buyerName}</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">{item.buyerPhone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {psychology && (
            <EmotionBadge emotion={emotion} label={psychology.sequenceType} />
          )}
          <span className="text-lg font-bold text-[var(--text-primary)]">
            {item.amount.toFixed(0)} <span className="text-xs font-medium text-[var(--text-tertiary)]">TND</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-extrabold tracking-tight ${riskColor(rl)}`}>
            {pct}%
          </span>
          <span className={`text-[10px] font-medium ${riskColor(rl)}`}>failure risk</span>
        </div>
        <div className="h-3 w-px bg-[var(--border)]" />
        <span className="text-[11px] text-[var(--text-secondary)]">
          Trust {item.trustScore}
        </span>
      </div>

      {psychology && showActions && (
        <div className="mt-3">
          <PsychologyCard
            sequenceType={psychology.sequenceType}
            psychologicalReason={psychology.psychologicalReason}
            expectedGoal={psychology.expectedGoal}
            previewMessage={psychology.previewMessage}
            className="animate-fade-in"
          />
        </div>
      )}

      {showActions && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); onAction(item.orderId, "confirm") }}
            disabled={sub === `${item.orderId}_confirm`}
            className="flex-1 rounded-lg bg-[var(--btn-green)]/90 px-3 py-2 text-xs font-medium text-white hover:bg-[var(--btn-green-hover)] disabled:opacity-50 transition-colors"
          >
            {sub === `${item.orderId}_confirm` ? "..." : "Secure Revenue"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction(item.orderId, "retry") }}
            disabled={sub === `${item.orderId}_retry`}
            className="flex-1 rounded-lg border border-[var(--warning-amber)]/30 px-3 py-2 text-xs font-medium text-[var(--warning-amber)] hover:bg-[var(--warning-amber-bg)] disabled:opacity-50 transition-colors"
          >
            {sub === `${item.orderId}_retry` ? "..." : "Re-contact"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction(item.orderId, "cancel") }}
            disabled={sub === `${item.orderId}_cancel`}
            className="flex-1 rounded-lg border border-[var(--risk-red)]/30 px-3 py-2 text-xs font-medium text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] disabled:opacity-50 transition-colors"
          >
            {sub === `${item.orderId}_cancel` ? "..." : "Prevent Loss"}
          </button>
        </div>
      )}
    </div>
  )
}

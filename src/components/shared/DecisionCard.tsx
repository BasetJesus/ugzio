"use client"

import { useState, useCallback } from "react"
import type { ConfirmationQueueItem } from "@/services/confirmation.service"
import type { PsychologyPreview } from "@/types/whatsapp"
import PsychologyCard from "@/components/shared/PsychologyCard"
import StatePulse from "@/components/shared/StatePulse"

interface Props {
  item: ConfirmationQueueItem
  psychology?: PsychologyPreview
  onAction: (orderId: string, action: string) => void
  onSelect?: () => void
  submitting?: string | null
}

function failurePct(item: ConfirmationQueueItem): number {
  if (item.riskLevel === "high") return 65 + Math.round((100 - item.trustScore) * 0.35)
  if (item.riskLevel === "medium") return 35 + Math.round((100 - item.trustScore) * 0.25)
  return Math.round((100 - item.trustScore) * 0.15)
}

function riskColor(level: string): string {
  if (level === "high") return "text-[var(--risk-red)]"
  if (level === "medium") return "text-[var(--warning-amber)]"
  return "text-[var(--success-green)]"
}

const PSYCH_PULSE: Record<string, "calm" | "focused" | "urgent" | "protected"> = {
  trust: "calm",
  reminder: "focused",
  urgency: "urgent",
  reassurance: "protected",
}

export default function DecisionCard({ item, psychology, onAction, onSelect, submitting }: Props) {
  const [confirming, setConfirming] = useState(false)
  const rl = item.riskLevel
  const pct = failurePct(item)
  const sub = submitting
  const pulseState = PSYCH_PULSE[psychology?.sequenceType ?? "trust"] ?? "calm"

  const handleAction = useCallback((e: React.MouseEvent, action: string) => {
    e.stopPropagation()
    setConfirming(true)
    onAction(item.orderId, action)
    setTimeout(() => setConfirming(false), 1500)
  }, [onAction, item.orderId])

  const handleSelect = useCallback(() => {
    if (onSelect) onSelect()
  }, [onSelect])

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 active:scale-[0.99] touch-manipulation ${
        rl === "high" ? "border-[var(--state-urgent)]/20 bg-[var(--state-urgent-bg)]" : "border-[var(--border)] bg-[var(--bg-card)]"
      }`}
      onClick={handleSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {psychology && <StatePulse state={pulseState} size="sm" />}
            <div>
              <p className="text-sm sm:text-base font-medium text-[var(--text-primary)] truncate">{item.buyerName}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">{item.buyerPhone}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${riskColor(rl).replace("text", "text")} ${
            rl === "high" ? "border-[var(--state-urgent)]/20 bg-[var(--state-urgent-bg)]" :
            rl === "medium" ? "border-[var(--warning-amber)]/20 bg-[var(--warning-amber-bg)]" :
            "border-[var(--success-green)]/20 bg-[var(--success-green-bg)]"
          }`}>
            {rl}
          </span>
          <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            {item.amount.toFixed(0)} <span className="text-xs font-medium text-[var(--text-tertiary)]">TND</span>
          </span>
        </div>
      </div>

      <div className={`flex items-center gap-3 mb-3 ${confirming ? "animate-pulse" : ""}`}>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-extrabold tracking-tight ${riskColor(rl)}`}>
            {pct}%
          </span>
          <span className={`text-[10px] font-medium ${riskColor(rl)}`}>failure</span>
        </div>
        <div className="h-3 w-px bg-[var(--border)]" />
        <span className="text-[11px] text-[var(--text-secondary)]">
          Trust {item.trustScore}
        </span>
      </div>

      {psychology && (
        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
          <PsychologyCard
            sequenceType={psychology.sequenceType}
            psychologicalReason={psychology.psychologicalReason}
            expectedGoal={psychology.expectedGoal}
            previewMessage={psychology.previewMessage}
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-2">
        <button
          onClick={(e) => handleAction(e, "confirm")}
          disabled={sub === `${item.orderId}_confirm`}
          className="rounded-lg bg-[var(--btn-green)]/90 py-3 text-sm font-semibold text-white hover:bg-[var(--btn-green-hover)] disabled:opacity-60 transition-all duration-200 active:scale-[0.97] touch-manipulation"
        >
          {sub === `${item.orderId}_confirm` ? "..." : "Secure"}
        </button>
        <button
          onClick={(e) => handleAction(e, "retry")}
          disabled={sub === `${item.orderId}_retry`}
          className="rounded-lg border border-[var(--warning-amber)]/30 py-3 text-sm font-semibold text-[var(--warning-amber)] hover:bg-[var(--warning-amber-bg)] disabled:opacity-60 transition-all duration-200 active:scale-[0.97] touch-manipulation"
        >
          {sub === `${item.orderId}_retry` ? "..." : "Re-contact"}
        </button>
        <button
          onClick={(e) => handleAction(e, "cancel")}
          disabled={sub === `${item.orderId}_cancel`}
          className="rounded-lg border border-[var(--risk-red)]/30 py-3 text-sm font-semibold text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] disabled:opacity-60 transition-all duration-200 active:scale-[0.97] touch-manipulation"
        >
          {sub === `${item.orderId}_cancel` ? "..." : "Prevent"}
        </button>
      </div>
    </div>
  )
}

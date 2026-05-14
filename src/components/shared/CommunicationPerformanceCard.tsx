"use client"

import type { CommunicationPerformance } from "@/types/whatsapp"
import { pct, tnd } from "@/lib/utils"

interface Props {
  data: CommunicationPerformance
  emotionalState?: "calm" | "focused" | "protected" | "stable"
}

const STATE_CONFIG = {
  calm: { accent: "var(--state-calm)", bar: "var(--state-calm-bg)" },
  focused: { accent: "var(--state-focused)", bar: "var(--state-focused-bg)" },
  protected: { accent: "var(--state-protected)", bar: "var(--state-protected-bg)" },
  stable: { accent: "var(--text-tertiary)", bar: "var(--bg-surface)" },
}

export default function CommunicationPerformanceCard({ data, emotionalState = "calm" }: Props) {
  const hasData = data.totalSent > 0
  const cfg = STATE_CONFIG[emotionalState]

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all duration-300">
      <p className="text-caption text-[var(--text-tertiary)] mb-card">Communication Performance</p>

      {!hasData ? (
        <div className="text-center py-4">
          <p className="text-xs text-[var(--text-secondary)]">No WhatsApp messages sent yet</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
            Send your first message to see metrics
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <p className="text-lg font-extrabold text-[var(--text-primary)]">{pct(data.replyRate)}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">Reply rate</p>
          </div>
          <div>
            <p className="text-lg font-extrabold" style={{ color: data.confirmationImprovement > 0 ? cfg.accent : "var(--text-primary)" }}>
              +{pct(data.confirmationImprovement)}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">Confirmation lift</p>
          </div>
          <div>
            <p className="text-lg font-extrabold" style={{ color: data.unreachableReduction > 0 ? cfg.accent : "var(--text-primary)" }}>
              -{pct(data.unreachableReduction)}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">Unreachable drop</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-secondary)]">RTS impact:</span>
          <span className="text-sm font-bold" style={{ color: data.rtsImpact > 0 ? "var(--state-protected)" : "var(--text-tertiary)" }}>
            {tnd(data.rtsImpact)}
          </span>
          <span className="text-[9px] text-[var(--text-tertiary)]">prevented</span>
        </div>
        {hasData && (
          <div className="flex items-center gap-2 text-[9px] text-[var(--text-tertiary)]">
            <span>{data.totalSent} sent</span>
            <span>{data.totalReplied} replied</span>
          </div>
        )}
      </div>
    </div>
  )
}

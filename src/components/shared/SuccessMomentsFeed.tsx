"use client"

import { useState, useEffect } from "react"
import type { SuccessMoment } from "@/services/pilot.service"
import { timeAgo, compactRhythmDelay } from "@/lib/utils"

interface Props {
  moments: SuccessMoment[]
}

const MOMENT_ICONS: Record<string, string> = {
  revenue_protected: "\uD83D\uDEE1\uFE0F",
  delivery_prevented: "\uD83D\uDEAB",
  buyer_confirmed: "\u2705",
  ugc_received: "\uD83D\uDCF7",
  first_action: "\uD83C\uDF1F",
}

const MOMENT_COLORS: Record<string, string> = {
  revenue_protected: "var(--state-protected)",
  delivery_prevented: "var(--state-urgent)",
  buyer_confirmed: "var(--state-calm)",
  ugc_received: "var(--psych-reassurance)",
  first_action: "var(--text-tertiary)",
}

const MOMENT_VERBS: Record<string, string> = {
  revenue_protected: "secured",
  delivery_prevented: "prevented",
  buyer_confirmed: "confirmed",
  ugc_received: "received",
  first_action: "started",
}

export default function SuccessMomentsFeed({ moments }: Props) {
  const [visible, setVisible] = useState<SuccessMoment[]>([])
  const [animating, setAnimating] = useState<string | null>(null)

  useEffect(() => {
    setVisible(moments.slice(0, 3))
  }, [moments])

  useEffect(() => {
    if (moments.length <= 1) return
    let idx = 3
    let timer: ReturnType<typeof setTimeout> | null = null

    function scheduleNext() {
      if (idx >= moments.length) return
      const delay = compactRhythmDelay(idx)
      timer = setTimeout(() => {
        const next = moments[idx]
        idx++
        setAnimating(next.id)
        setVisible((prev) => [...prev, next])
        setTimeout(() => setAnimating(null), 600)
        scheduleNext()
      }, delay)
    }

    scheduleNext()
    return () => { if (timer) clearTimeout(timer) }
  }, [moments])

  if (moments.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
          <p className="text-caption text-[var(--text-tertiary)]">Today</p>
          <p className="text-display text-[var(--text-primary)] mt-1">Activity</p>
        </div>
        <div className="px-panel py-6 text-center">
          <p className="text-xs text-[var(--text-secondary)]">No activity yet today</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Outcomes will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <p className="text-caption text-[var(--text-tertiary)]">Today</p>
        <h2 className="text-display text-[var(--text-primary)] mt-1">Success Moments</h2>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {visible.map((m) => {
          const icon = MOMENT_ICONS[m.type] ?? "\u2022"
          const color = MOMENT_COLORS[m.type] ?? "var(--text-tertiary)"
          const verb = MOMENT_VERBS[m.type] ?? "completed"
          const isNew = animating === m.id

          return (
            <div
              key={m.id}
              className={"flex items-start gap-3 px-panel py-3 transition-all duration-500 " + (isNew ? "animate-emotion-transition" : "")}
            >
              <span className="text-sm mt-0.5 shrink-0">{icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--text-primary)]" style={{ color }}>
                  {m.label}
                </p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[9px] text-[var(--text-tertiary)]">
                  {timeAgo(m.timestamp)}
                </span>
                <span className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">
                  {verb}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

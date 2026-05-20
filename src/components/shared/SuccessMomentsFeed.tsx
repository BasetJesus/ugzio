"use client"

import { useState, useEffect } from "react"
import type { SuccessMoment } from "@/services/pilot.service"
import { timeAgo, compactRhythmDelay } from "@/lib/utils"

interface Props {
  moments: SuccessMoment[]
}

const MOMENT_ICONS: Record<string, string> = {
  revenue_protected: "🛡️",
  delivery_prevented: "🚫",
  buyer_confirmed: "✅",
  ugc_received: "📷",
  first_action: "🌟",
}

const MOMENT_COLORS: Record<string, string> = {
  revenue_protected: "var(--state-protected)",
  delivery_prevented: "var(--state-urgent)",
  buyer_confirmed: "var(--state-calm)",
  ugc_received: "var(--psych-reassurance)",
  first_action: "var(--text-tertiary)",
}

const MOMENT_VERBS: Record<string, string> = {
  revenue_protected: "sécurisé",
  delivery_prevented: "évité",
  buyer_confirmed: "confirmé",
  ugc_received: "reçu",
  first_action: "démarré",
}

export default function SuccessMomentsFeed({ moments }: Props) {
  const [extraVisible, setExtraVisible] = useState<SuccessMoment[]>([])
  const [animating, setAnimating] = useState<string | null>(null)
  const visible = [...moments.slice(0, 3), ...extraVisible]

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExtraVisible([])
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
        setExtraVisible((prev) => [...prev, next])
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
          <p className="text-caption text-[var(--text-tertiary)]">Aujourd&apos;hui</p>
          <p className="text-display text-[var(--text-primary)] mt-1">Activité</p>
        </div>
        <div className="px-panel py-6 text-center">
          <p className="text-xs text-[var(--text-secondary)]">Aucune activité aujourd&apos;hui</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Les résultats apparaîtront ici</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <p className="text-caption text-[var(--text-tertiary)]">Aujourd&apos;hui</p>
        <h2 className="text-display text-[var(--text-primary)] mt-1">Moments de succès</h2>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {visible.map((m) => {
          const icon = MOMENT_ICONS[m.type] ?? "•"
          const color = MOMENT_COLORS[m.type] ?? "var(--text-tertiary)"
          const verb = MOMENT_VERBS[m.type] ?? "terminé"
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

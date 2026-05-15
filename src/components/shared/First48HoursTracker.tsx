"use client"

import type { First48HoursData } from "@/services/pilot.service"

interface Props {
  data: First48HoursData
}

export default function First48HoursTracker({ data }: Props) {
  if (!data.isActive || data.milestones.length === 0) return null

  const doneCount = data.milestones.filter((m) => m.done).length
  const remaining = data.milestones.length - doneCount
  const hoursLeft = Math.max(0, 48 - data.hoursSinceOnboarding)

  return (
    <div className="rounded-xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--emotion-calm)] to-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--accent)]/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-[var(--accent)]">Premières 48 Heures</p>
            <h2 className="text-display text-[var(--text-primary)] mt-1">
              Traqueur de momentum
            </h2>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--accent)]">{hoursLeft}h</p>
            <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider">restantes</p>
          </div>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {remaining > 0 ? remaining + " étapes restantes — continuez !" : "Tous les jalons atteints ! Votre boutique est en ligne."}
        </p>
      </div>

      <div className="p-panel">
        <div className="space-y-0">
          {data.milestones.map((m, i) => (
            <div key={m.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={"h-3 w-3 rounded-full border-2 flex items-center justify-center text-[8px] " + (m.done ? "bg-[var(--success-green)] border-[var(--success-green)] text-white" : "border-[var(--border)]")}
                >
                  {m.done ? "✓" : ""}
                </div>
                {i < data.milestones.length - 1 && (
                  <div className={"w-px flex-1 " + (m.done ? "bg-[var(--success-green)]/30" : "bg-[var(--border)]")} />
                )}
              </div>
              <div className={"pb-inline flex-1 min-w-0 " + (i === data.milestones.length - 1 ? "pb-0" : "")}>
                <div className="flex items-center justify-between">
                  <span className={"text-xs " + (m.done ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-tertiary)]")}>
                    {m.label}
                  </span>
                  <span className={"text-[9px] " + (m.done ? "text-[var(--success-green)]" : "text-[var(--text-tertiary)]")}>
                    {m.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

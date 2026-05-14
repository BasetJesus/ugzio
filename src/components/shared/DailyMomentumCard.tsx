"use client"

import type { DailyMomentum } from "@/services/seller-context.service"

interface Props {
  data: DailyMomentum
  hasOutcomes: boolean
}

export default function DailyMomentumCard({ data, hasOutcomes }: Props) {
  const isActive = hasOutcomes || data.streak > 0

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={"h-1.5 w-1.5 rounded-full " + (isActive ? "animate-pulse-protected" : "")}
            style={{ backgroundColor: isActive ? "var(--state-protected)" : "var(--text-tertiary)" }}
          />
          <p className="text-caption" style={{ color: isActive ? "var(--state-protected)" : "var(--text-tertiary)" }}>
            {isActive ? data.streakLabel : "No activity yet today"}
          </p>
        </div>
        <h2 className="text-display text-[var(--text-primary)] mt-1">
          {isActive ? "Today's Momentum" : "Daily Pulse"}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-panel p-panel">
        <div>
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Protected</p>
          <p className="text-base font-semibold mt-0.5" style={{ color: data.protectedToday > 0 ? "var(--state-protected)" : "var(--text-tertiary)" }}>
            {data.protectedToday > 0 ? `${data.protectedToday.toFixed(0)} TND` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Confirmed</p>
          <p className="text-base font-semibold mt-0.5 text-[var(--text-primary)]">
            {data.confirmations > 0 ? data.confirmations : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Replied</p>
          <p className="text-base font-semibold mt-0.5 text-[var(--text-primary)]">
            {data.buyersReplied > 0 ? data.buyersReplied : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">UGC</p>
          <p className="text-base font-semibold mt-0.5 text-[var(--text-primary)]">
            {data.ugcRequests > 0 ? data.ugcRequests : "—"}
          </p>
        </div>
      </div>

      {isActive && (
        <div className="px-panel pb-panel">
          <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: Math.min(data.streak * 10, 100) + "%",
                backgroundColor: "var(--state-protected)",
                opacity: 0.4,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

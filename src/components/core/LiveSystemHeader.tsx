"use client"

import { usePathname } from "next/navigation"
import { configFromPath } from "@/lib/core/system-state"
import StatePulse from "@/components/shared/StatePulse"
import NotificationBell from "@/components/shared/NotificationBell"
import ThemeToggle from "@/components/shared/ThemeToggle"

interface Props {
  orgName: string
  planName: string
  orgId: string
  revenueAtRisk: number
}

export default function LiveSystemHeader({ orgName, planName, orgId, revenueAtRisk }: Props) {
  const pathname = usePathname()
  const state = configFromPath(pathname)

  const pulseState = revenueAtRisk > 500 ? "urgent" : revenueAtRisk > 100 ? "focused" : "calm"

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 sm:px-8 py-2.5">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)] text-[11px] font-bold text-white">U</span>
            <span className="text-sm font-semibold text-[var(--text-primary)] hidden sm:inline">UGZIO</span>
          </div>

          <StatePulse state={pulseState} />

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
            <span className="text-xs" style={{ color: state.color }}>{state.icon}</span>
            <span>{state.label}</span>
            <span className="mx-1">\u00B7</span>
            <span className="truncate max-w-[120px]">{orgName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[var(--nav-border)] bg-[var(--bg-card)]/50 px-2.5 py-1">
            <span className="text-[10px] text-[var(--text-tertiary)]">At risk</span>
            <span className="text-xs font-semibold text-[var(--risk-red)]">{revenueAtRisk.toFixed(0)} TND</span>
          </div>
          <NotificationBell orgId={orgId} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

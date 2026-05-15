"use client"

import Link from "next/link"
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
            <span className="mx-1">·</span>
            <span className="truncate max-w-[120px]">{orgName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[var(--nav-border)] bg-[var(--bg-card)]/50 px-2.5 py-1">
            <span className="text-[10px] text-[var(--text-tertiary)]">At risk</span>
            <span className="text-xs font-semibold text-[var(--risk-red)]">{revenueAtRisk.toFixed(0)} TND</span>
          </div>
          <Link
            href="/settings/delivery"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-tertiary)] transition hover:text-[var(--text-secondary)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
          <NotificationBell orgId={orgId} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

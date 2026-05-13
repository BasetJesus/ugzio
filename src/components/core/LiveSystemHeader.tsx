"use client"

import { usePathname } from "next/navigation"
import { configFromPath } from "@/lib/core/system-state"
import { useTheme } from "@/lib/ui/theme-provider"
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
  const { theme } = useTheme()
  const state = configFromPath(pathname)

  const indicator = revenueAtRisk > 500 ? "critical" : revenueAtRisk > 100 ? "medium" : "low"
  const indicatorColor = indicator === "critical" ? "var(--risk-red)" : indicator === "medium" ? "var(--warning-amber)" : "var(--success-green)"

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-[10px] font-bold text-white">U</span>
            <span className="text-sm font-bold text-[var(--text-primary)] hidden sm:inline">UGZIO</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-[var(--nav-border)] px-2.5 py-0.5">
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: indicatorColor }}
            />
            <span className="text-[10px] font-medium text-[var(--text-secondary)]">
              {indicator === "critical" ? "Critical" : indicator === "medium" ? "Elevated" : "Stable"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
            <span className="font-medium" style={{ color: state.color }}>{state.icon}</span>
            <span>{state.label}</span>
            <span className="mx-1">·</span>
            <span className="truncate max-w-[120px]">{orgName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[var(--nav-border)] px-2.5 py-1">
            <span className="text-[10px] text-[var(--text-tertiary)]">At risk</span>
            <span className="text-xs font-bold text-[var(--risk-red)]">{revenueAtRisk.toFixed(0)} TND</span>
          </div>
          <NotificationBell orgId={orgId} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

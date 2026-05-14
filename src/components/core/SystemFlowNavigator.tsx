"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import { SYSTEM_STATES, stateFromPath } from "@/lib/core/system-state"
import type { SystemState } from "@/lib/core/system-state"

interface Props {
  orgName: string
  planName: string
  completedCount: number
}

const STATE_KEYS: SystemState[] = ["LIVE", "DECISION", "HISTORY"]

export default function SystemFlowNavigator({ orgName, planName, completedCount }: Props) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const currentState = stateFromPath(pathname)
  const showOnboarding = completedCount < 4

  return (
    <aside className="hidden w-56 border-r border-[var(--nav-border)] bg-[var(--nav-bg)] p-section sm:flex sm:flex-col">
      <div className="flex items-center gap-3 px-2 mb-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-xs font-bold text-white">U</span>
        <div className="flex flex-col">
          <p className="truncate text-xs font-medium text-[var(--text-primary)]">{orgName}</p>
          <p className="text-[9px] text-[var(--text-tertiary)]">{planName}</p>
        </div>
      </div>

      <div className="flex flex-col gap-tight flex-1">
        {STATE_KEYS.map((key) => {
          const cfg = SYSTEM_STATES[key]
          const active = currentState === key
          return (
            <Link
              key={key}
              href={cfg.route}
              className={`group rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                  : "text-[var(--text-tertiary)] hover:bg-[var(--border)]/20 hover:text-[var(--text-secondary)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-4 text-center text-sm ${active && key === "LIVE" ? "animate-pulse" : ""}`}
                  style={{ color: active ? cfg.color : undefined }}
                >
                  {cfg.icon}
                </span>
                <div className="flex flex-col">
                  <span>{cfg.label}</span>
                  <span className="text-[9px] text-[var(--text-tertiary)]">{cfg.description}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="pt-panel border-t border-[var(--nav-border)]">
        <Link
          href="/inbox"
          className={`group rounded-lg px-3 py-2 text-xs font-medium transition flex items-center gap-3 ${
            pathname.startsWith("/inbox")
              ? "bg-[var(--accent)]/10 text-[var(--accent)]"
              : "text-[var(--text-tertiary)] hover:bg-[var(--border)]/20 hover:text-[var(--text-secondary)]"
          }`}
        >
          <span className="text-sm">📸</span>
          <span>{t("nav.inbox")}</span>
        </Link>
      </div>

      {showOnboarding && (
        <div className="pt-panel border-t border-[var(--nav-border)]">
          <Link
            href="/onboarding"
            className={`block rounded-lg px-3 py-2 text-xs font-medium transition ${
              currentState === "ACTIVATION"
                ? "bg-[var(--success-green-bg)] text-[var(--success-green)]"
                : "text-[var(--text-tertiary)] hover:bg-[var(--border)]/20 hover:text-[var(--text-secondary)]"
            }`}
          >
            Setup {completedCount}/4
          </Link>
        </div>
      )}

      <div className="pt-panel mt-auto border-t border-[var(--nav-border)]">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
            window.location.href = "/login"
          }}
          className="w-full rounded-lg px-3 py-2 text-left text-xs text-[var(--text-tertiary)] transition hover:text-[var(--risk-red)]"
        >
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  )
}

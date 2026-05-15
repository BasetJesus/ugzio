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

const STATE_LABEL_KEYS: Record<string, string> = {
  LIVE: "nav.state-live",
  DECISION: "nav.state-decision",
  HISTORY: "nav.state-history",
}

const STATE_DESC_KEYS: Record<string, string> = {
  LIVE: "nav.state-live-desc",
  DECISION: "nav.state-decision-desc",
  HISTORY: "nav.state-history-desc",
}

export default function SystemFlowNavigator({ orgName, planName, completedCount }: Props) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const currentState = stateFromPath(pathname)
  const showOnboarding = completedCount < 4

  return (
    <aside className="hidden w-56 border-r border-[var(--nav-border)] bg-[var(--nav-bg)] sm:flex sm:flex-col">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-[var(--nav-border)]">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-xs font-bold text-white">U</span>
        <div className="flex flex-col min-w-0">
          <p className="truncate text-xs font-medium text-[var(--text-primary)]">{orgName}</p>
          <p className="text-[9px] text-[var(--text-tertiary)]">{planName}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {STATE_KEYS.map((key) => {
          const cfg = SYSTEM_STATES[key]
          const active = currentState === key
          return (
            <Link
              key={key}
              href={cfg.route}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                  : "text-[var(--text-tertiary)] hover:bg-[var(--border)]/20 hover:text-[var(--text-secondary)]"
              }`}
            >
              <span
                className={`w-4 text-center text-sm ${active && key === "LIVE" ? "animate-pulse" : ""}`}
                style={{ color: active ? cfg.color : undefined }}
              >
                {cfg.icon}
              </span>
              <div className="flex flex-col">
                <span>{t(STATE_LABEL_KEYS[key])}</span>
                <span className="text-[9px] leading-none text-[var(--text-tertiary)]">{t(STATE_DESC_KEYS[key])}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-1 border-t border-[var(--nav-border)]">
        <p className="px-3 pb-1 text-[9px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">{t("nav.protection")}</p>
        <Link
          href="/inbox"
          className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
            pathname === "/inbox"
              ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
              : "text-[var(--text-tertiary)] hover:bg-[var(--border)]/20 hover:text-[var(--text-secondary)]"
          }`}
        >
          <span className="w-4 text-center text-sm">📥</span>
          <div className="flex flex-col">
            <span>{t("nav.ugc")}</span>
            <span className="text-[9px] leading-none text-[var(--text-tertiary)]">{t("nav.ugc-desc")}</span>
          </div>
        </Link>
        <Link
          href="/blacklist"
          className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
            pathname === "/blacklist"
              ? "bg-[var(--risk-red)]/10 text-[var(--risk-red)] font-medium"
              : "text-[var(--text-tertiary)] hover:bg-[var(--border)]/20 hover:text-[var(--text-secondary)]"
          }`}
        >
          <span className="w-4 text-center text-sm">⊘</span>
          <div className="flex flex-col">
            <span>{t("nav.blacklist")}</span>
            <span className="text-[9px] leading-none text-[var(--text-tertiary)]">{t("nav.blacklist-desc")}</span>
          </div>
        </Link>
      </div>

      <div className="px-3 py-2 border-t border-[var(--nav-border)]" />

      {showOnboarding && (
        <div className="px-3 py-2 border-t border-[var(--nav-border)]">
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

      <div className="px-3 pt-2 border-t border-[var(--nav-border)] space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-tertiary)] transition hover:text-[var(--text-secondary)]"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          {t("nav.settings")}
        </Link>
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

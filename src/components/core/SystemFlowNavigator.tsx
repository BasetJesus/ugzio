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
    <aside className="hidden w-52 border-r border-[var(--nav-border)] bg-[var(--nav-bg)] p-3 sm:flex sm:flex-col">
      <div className="flex items-center gap-2 mb-5 px-2">
        <div className="flex flex-col">
          <p className="truncate text-xs font-medium text-[var(--text-primary)]">{orgName}</p>
          <p className="text-[9px] text-[var(--text-tertiary)]">{planName}</p>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 flex-1">
        <p className="px-2 pb-1.5 text-[9px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
          System Flow
        </p>
        {STATE_KEYS.map((key) => {
          const cfg = SYSTEM_STATES[key]
          const active = currentState === key
          return (
            <Link
              key={key}
              href={cfg.route}
              className={`group rounded-md px-2 py-1.5 text-sm transition ${
                active
                  ? "bg-[var(--accent)]/20 font-medium"
                  : "text-[var(--text-tertiary)] hover:bg-[var(--border)]/20 hover:text-[var(--text-secondary)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: active ? cfg.color : undefined }}>{cfg.icon}</span>
                <div className="flex flex-col">
                  <span style={{ color: active ? cfg.color : undefined }}>{cfg.label}</span>
                  <span className="text-[9px] text-[var(--text-tertiary)]">{cfg.description}</span>
                </div>
              </div>
            </Link>
          )
        })}
        <div className="mt-2 pt-2 border-t border-[var(--nav-border)]">
          <Link
            href="/intelligence"
            className={`group rounded-md px-2 py-1.5 text-sm transition ${
              pathname.startsWith("/intelligence")
                ? "bg-[var(--accent)]/20 font-medium"
                : "text-[var(--text-tertiary)] hover:bg-[var(--border)]/20 hover:text-[var(--text-secondary)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🧠</span>
              <div className="flex flex-col">
                <span>Intelligence</span>
                <span className="text-[9px] text-[var(--text-tertiary)]">What works</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {showOnboarding && (
        <div className="pt-2 border-t border-[var(--nav-border)]">
          <Link
            href="/onboarding"
            className={`block rounded-md px-2 py-1.5 text-xs font-medium transition ${
              currentState === "ACTIVATION"
                ? "bg-[var(--success-green-bg)] text-[var(--success-green)]"
                : "text-[var(--text-tertiary)] hover:bg-[var(--border)]/20 hover:text-[var(--text-secondary)]"
            }`}
          >
            Setup {completedCount}/4
          </Link>
        </div>
      )}

      <div className="pt-2 border-t border-[var(--nav-border)] mt-2">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
            window.location.href = "/login"
          }}
          className="w-full rounded-md px-2 py-1.5 text-left text-xs text-[var(--text-tertiary)] transition hover:text-[var(--risk-red)]"
        >
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  )
}

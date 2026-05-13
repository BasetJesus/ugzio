"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import { SYSTEM_STATES, stateFromPath } from "@/lib/core/system-state"

interface NavItem {
  href: string
  labelKey: string
  stateKey: "LIVE" | "DECISION" | "HISTORY" | null
  emotionIcon: string
}

const ITEMS: NavItem[] = [
  { href: "/overview", labelKey: "nav.overview", stateKey: "LIVE", emotionIcon: "\u25CF" },
  { href: "/confirm", labelKey: "nav.confirm", stateKey: "DECISION", emotionIcon: "\u25C6" },
  { href: "/orders", labelKey: "nav.orders", stateKey: "HISTORY", emotionIcon: "\u25B8" },
  { href: "#logout", labelKey: "nav.logout", stateKey: null, emotionIcon: "\u2190" },
] as const

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const currentState = stateFromPath(pathname)

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    window.location.href = "/login"
  }

  const isActive = (item: NavItem) => item.stateKey ? currentState === item.stateKey : false
  const getAccent = (item: NavItem) => item.stateKey ? SYSTEM_STATES[item.stateKey].color : "var(--text-tertiary)"

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--nav-border)] bg-[var(--bg-base)] sm:hidden">
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => {
          const active = isActive(item)
          const accent = getAccent(item)

          if (item.href === "#logout") {
            return (
              <button
                key={item.href}
                onClick={handleLogout}
                className="flex flex-col items-center gap-0.5 py-3 px-3 text-[10px] font-medium transition flex-1"
                style={{ color: active ? accent : "var(--text-tertiary)" }}
              >
                <span className={`text-sm ${active && item.stateKey === "LIVE" ? "animate-pulse-soft" : ""}`}>
                  {item.emotionIcon}
                </span>
                <span>{t(item.labelKey)}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-3 px-3 text-[10px] font-medium transition flex-1"
              style={{ color: active ? accent : "var(--text-tertiary)" }}
            >
              <span className={`text-sm ${active && item.stateKey === "LIVE" ? "animate-pulse-soft" : ""}`}>
                {item.emotionIcon}
              </span>
              <span>{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

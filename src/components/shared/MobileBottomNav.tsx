"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import { SYSTEM_STATES, stateFromPath } from "@/lib/core/system-state"

const ITEMS = [
  { href: "/overview", labelKey: "nav.overview", icon: "\u25CF", key: "LIVE" as const },
  { href: "/confirm", labelKey: "nav.confirm", icon: "\u25C6", key: "DECISION" as const },
  { href: "/orders", labelKey: "nav.orders", icon: "\u25B8", key: "HISTORY" as const },
  { href: "#logout", labelKey: "nav.logout", icon: "\u2190", key: null },
] as const

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const currentState = stateFromPath(pathname)

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    window.location.href = "/login"
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--nav-border)] bg-[var(--bg-base)] sm:hidden">
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => {
          const isActive = item.key ? currentState === item.key : false
          const accent = item.key ? SYSTEM_STATES[item.key].color : "var(--text-tertiary)"

          if (item.href === "#logout") {
            return (
              <button
                key={item.href}
                onClick={handleLogout}
                className="flex flex-col items-center gap-0.5 py-3 px-3 text-[10px] font-medium transition"
                style={{ color: isActive ? accent : "var(--text-tertiary)" }}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-3 px-3 text-[10px] font-medium transition"
              style={{ color: isActive ? accent : "var(--text-tertiary)" }}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

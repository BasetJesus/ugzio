"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import { SYSTEM_STATES, stateFromPath } from "@/lib/core/system-state"

interface NavItem {
  href: string
  labelKey: string
  stateKey: "LIVE" | "DECISION" | "HISTORY" | null
  icon: string
}

const ITEMS: NavItem[] = [
  { href: "/overview", labelKey: "nav.overview", stateKey: "LIVE", icon: "\u25CF" },
  { href: "/confirm", labelKey: "nav.confirm", stateKey: "DECISION", icon: "\u25C6" },
  { href: "/inbox", labelKey: "nav.inbox", stateKey: null, icon: "\uD83D\uDCF8" },
  { href: "/orders", labelKey: "nav.orders", stateKey: "HISTORY", icon: "\u25B8" },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const currentState = stateFromPath(pathname)

  const isActive = (item: NavItem) => item.stateKey ? currentState === item.stateKey : false
  const getAccent = (item: NavItem) => item.stateKey ? SYSTEM_STATES[item.stateKey].color : "var(--text-tertiary)"

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--nav-border)] bg-[var(--bg-base)] pb-safe sm:hidden">
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => {
          const active = isActive(item)
          const accent = getAccent(item)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-3 px-4 text-[10px] font-medium transition flex-1 min-h-[52px] justify-center"
              style={{ color: active ? accent : "var(--text-tertiary)" }}
            >
              <span className={`text-sm leading-none ${active && item.stateKey === "LIVE" ? "animate-pulse" : ""}`}>
                {item.icon}
              </span>
              <span>{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

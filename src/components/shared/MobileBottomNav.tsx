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
  { href: "/overview", labelKey: "nav.overview", stateKey: "LIVE", icon: "●" },
  { href: "/confirm", labelKey: "nav.confirm", stateKey: "DECISION", icon: "◆" },
  { href: "/inbox", labelKey: "nav.inbox", stateKey: null, icon: "📸" },
  { href: "/growth", labelKey: "nav.growth", stateKey: null, icon: "📈" },
  { href: "/orders", labelKey: "nav.orders", stateKey: "HISTORY", icon: "▸" },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const currentState = stateFromPath(pathname)

  const isActive = (item: NavItem) => item.stateKey ? currentState === item.stateKey : false
  const getAccent = (item: NavItem) => item.stateKey ? SYSTEM_STATES[item.stateKey].color : "var(--text-tertiary)"

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--nav-border)] bg-[var(--bg-base)] pb-safe sm:hidden">
      <div className="flex items-stretch">
        {ITEMS.map((item) => {
          const active = isActive(item)
          const accent = getAccent(item)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition"
              style={{ color: active ? accent : "var(--text-tertiary)" }}
            >
              {active && (
                <span
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
              )}
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

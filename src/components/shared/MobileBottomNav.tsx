"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"

interface Tab {
  href: string
  label: string
  icon: string
  badge?: number | null
}

interface Props {
  pendingCount?: number
  highRiskCount?: number
}

export default function MobileBottomNav({ pendingCount = 0, highRiskCount = 0 }: Props) {
  const pathname = usePathname()
  const { t } = useLanguage()

  const tabs: Tab[] = [
    { href: "/overview", label: "nav.overview", icon: "●" },
    { href: "/orders", label: "nav.orders", icon: "▸", badge: highRiskCount > 0 ? highRiskCount : null },
    { href: "/confirm", label: "nav.confirm", icon: "◆", badge: pendingCount > 0 ? pendingCount : null },
    { href: "/shield", label: "nav.shield", icon: "🛡" },
    { href: "/inbox", label: "nav.inbox", icon: "📥" },
    { href: "/capture", label: "nav.capture", icon: "📸" },
    { href: "/flow", label: "nav.flow", icon: "✨" },
    { href: "/settings", label: "nav.settings", icon: "⚙" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-xl pb-safe sm:hidden">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => { try { navigator.vibrate?.(10) } catch {} }}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition duration-150"
              style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
            >
              <span className="relative text-lg leading-none">
                {tab.icon}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-[var(--status-danger)] px-1 text-[8px] font-bold text-white">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px]">{t(tab.label)}</span>
              {active && (
                <span className="absolute -top-px left-1/4 right-1/4 h-0.5 rounded-full bg-[var(--accent)]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

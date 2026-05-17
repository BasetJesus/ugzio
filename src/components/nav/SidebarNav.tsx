"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import LanguageToggle from "@/components/shared/LanguageToggle"

interface Props {
  orgName: string
  planName: string
  completedCount: number
  pendingCount?: number
  highRiskCount?: number
}

const NAV_ITEMS = [
  { href: "/overview", label: "nav.overview", icon: "●" },
  { href: "/orders", label: "nav.orders", icon: "▸" },
  { href: "/confirm", label: "nav.confirm", icon: "◆" },
  { href: "/inbox", label: "nav.inbox", icon: "📥" },
  { href: "/settings", label: "nav.settings", icon: "⚙" },
]

export default function SidebarNav({ orgName, planName, completedCount, pendingCount = 0, highRiskCount = 0 }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <aside
      className={`hidden border-r border-[var(--border)] bg-[var(--bg-surface)] sm:flex sm:flex-col transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className={`flex items-center border-b border-[var(--border)] ${collapsed ? "justify-center p-3" : "gap-3 px-4 py-4"}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-xs font-bold text-white hover:bg-[var(--accent-hover)]"
        >
          U
        </button>
        {!collapsed && (
          <>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[var(--text-primary)]">{orgName}</p>
              <p className="text-[9px] text-[var(--text-muted)]">{planName}</p>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              ◀
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          const badge = item.href === "/confirm" ? pendingCount : item.href === "/orders" ? highRiskCount : null
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center rounded-xl text-sm transition ${
                collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
              } ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="relative">
                <span className="text-base">{item.icon}</span>
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-[var(--status-danger)] px-1 text-[8px] font-bold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              {!collapsed && <span>{t(item.label)}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={`border-t border-[var(--border)] p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-medium text-[var(--accent)]">
              {orgName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="truncate text-xs text-[var(--text-primary)]">{orgName}</p>
            </div>
          </div>
        )}
        <div className={collapsed ? "" : "flex items-center gap-2"}>
          <LanguageToggle />
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
              window.location.href = "/login"
            }}
            className={`rounded-lg text-xs text-[var(--text-muted)] transition hover:text-[var(--status-danger)] ${
              collapsed ? "p-2" : "px-3 py-2"
            }`}
          >
            {collapsed ? "↩" : t("nav.logout")}
          </button>
        </div>
      </div>
    </aside>
  )
}

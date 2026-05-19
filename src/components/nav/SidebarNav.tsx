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

const PROTECT_ITEMS = [
  { href: "/overview", label: "nav.overview", icon: "●" },
  { href: "/confirm", label: "nav.confirm", icon: "◆" },
  { href: "/orders", label: "nav.orders", icon: "▸" },
]

const GROW_ITEMS = [
  { href: "/inbox", label: "nav.inbox", icon: "📥" },
  { href: "/growth", label: "nav.growth", icon: "📈" },
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
          className="relative flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "transparent" }}
        >
          <span className="text-xs font-bold" style={{ color: "#FFD60A" }}>Z</span>
        </button>
        {!collapsed && (
          <>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-xs font-bold tracking-tight">
                <span className="text-[var(--text-primary)]">UG</span>
                <span style={{ color: "#FFD60A" }}>Z</span>
                <span className="text-[var(--text-muted)]">IO</span>
              </p>
              <p className="text-[8px] text-[var(--text-muted)]">
                <span className="text-[var(--accent)]">PROTECT</span>
                <span className="mx-1">·</span>
                <span style={{ color: "#FF9500" }}>GROW</span>
              </p>
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
        {!collapsed && (
          <p className="px-3 py-1 text-[9px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255, 214, 10, 0.6)" }}>
            {t("nav.protect")}
          </p>
        )}
        {PROTECT_ITEMS.map((item) => {
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

        {!collapsed && (
          <div className="mt-3 mb-1 px-3 py-1 text-[9px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255, 149, 0, 0.6)" }}>
            {t("nav.grow")}
          </div>
        )}
        {GROW_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center rounded-xl text-sm transition ${
                collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
              } ${
                active
                  ? "bg-orange-500/10 font-medium" : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              }`}
              style={active ? { color: "#FF9500" } : {}}
            >
              <span className="relative">
                <span className="text-base">{item.icon}</span>
              </span>
              {!collapsed && <span>{t(item.label)}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pb-1">
        {(["settings"] as const).map((item) => {
          const active = pathname.startsWith("/" + item)
          return (
            <Link
              key={item}
              href={"/" + item}
              className={`group flex items-center rounded-xl text-sm transition ${
                collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
              } ${
                active
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <span className="text-base">⚙</span>
              {!collapsed && <span>{t("nav.settings")}</span>}
            </Link>
          )
        })}
      </div>
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

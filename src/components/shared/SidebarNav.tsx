"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import NotificationBell from "./NotificationBell"

interface Props {
  orgName: string
  planName: string
  orgId: string
  completedCount: number
}

const NAV_ITEMS = [
  { href: "/overview", labelKey: "nav.overview", icon: "⌘" },
  { href: "/confirm", labelKey: "nav.confirm", icon: "✅" },
  { href: "/orders", labelKey: "nav.orders", icon: "📦" },
] as const

export default function SidebarNav({ orgName, planName, orgId, completedCount }: Props) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const showOnboarding = completedCount < 4

  return (
    <aside className="hidden w-52 border-r border-[var(--nav-border)] bg-[var(--nav-bg)] p-3 sm:flex sm:flex-col">
      <div className="mb-5 flex items-center justify-between px-2">
        <Link href="/overview" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-[10px] font-bold text-white">U</span>
          <span className="text-sm font-bold text-[var(--text-primary)]">UGZIO</span>
        </Link>
        <NotificationBell orgId={orgId} />
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-2 py-1.5 text-sm transition ${
                active
                  ? "bg-[var(--accent)]/20 text-[var(--accent)] font-medium"
                  : "text-[var(--text-tertiary)] hover:bg-[var(--border)]/20 hover:text-[var(--text-secondary)]"
              }`}
            >
              {item.icon} {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>
      {showOnboarding && (
        <div className="pt-3 border-t border-[var(--nav-border)]">
          <Link
            href="/onboarding"
            className="block rounded-md bg-[var(--success-green-bg)] px-2 py-1.5 text-xs font-medium text-[var(--success-green)] transition hover:bg-[var(--success-green-bg)]/80"
          >
            {t("nav.onboarding").replace("{n}", String(completedCount))}
          </Link>
        </div>
      )}
      <div className="pt-3 border-t border-[var(--nav-border)] mt-3">
        <p className="truncate px-2 text-xs text-[var(--text-tertiary)]">{orgName}</p>
        <p className="px-2 text-[10px] text-[var(--text-tertiary)] opacity-60">{planName}</p>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
            window.location.href = "/login"
          }}
          className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-xs text-[var(--text-tertiary)] transition hover:text-[var(--risk-red)]"
        >
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface Tab {
  href: string
  label: string
  short: string
  badge?: number | null
}

interface Props {
  pendingCount?: number
  highRiskCount?: number
}

const TABS: Tab[] = [
  { href: "/overview", label: "ZIOView", short: "View" },
  { href: "/confirm", label: "ZIOConfirm", short: "Confirm", badge: 0 },
  { href: "/orders", label: "ZIOOrders", short: "Orders", badge: 0 },
  { href: "/shield", label: "ZIOShield", short: "Shield" },
  { href: "/inbox", label: "ZIOInbox", short: "Inbox" },
]

export default function BottomNav({ pendingCount = 0, highRiskCount = 0 }: Props) {
  const pathname = usePathname()

  const tabs = TABS.map((t) => ({
    ...t,
    badge: t.href === "/confirm" ? (pendingCount > 0 ? pendingCount : null) : t.href === "/orders" ? (highRiskCount > 0 ? highRiskCount : null) : null,
  }))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-xl pb-safe">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition duration-150"
              style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
            >
              <span className="relative text-[11px] leading-none tracking-wide">
                {active ? (
                  <span className="text-[var(--accent)]">ZIO</span>
                ) : (
                  <span className="text-[var(--text-muted)]">ZIO</span>
                )}
                <span style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {tab.short}
                </span>
              </span>
              {tab.badge != null && tab.badge > 0 && (
                <span className="absolute -top-0.5 -right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[var(--status-danger)] px-1 text-[7px] font-bold text-white">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
              {active && (
                <span className="absolute -top-px left-1/4 right-1/4 h-[2px] rounded-full bg-[var(--accent)]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

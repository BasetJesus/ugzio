"use client"

import Link from "next/link"
import { useLanguage } from "../../../app/context/LanguageContext"
import NotificationBell from "./NotificationBell"

const PILLARS = [
  {
    labelKey: "nav.activate",
    icon: "📤",
    items: [
      { href: "/orders", labelKey: "nav.orders" },
      { href: "/orders/new", labelKey: "nav.new-order" },
      { href: "/confirm", labelKey: "nav.confirm" },
    ],
  },
  {
    labelKey: "nav.collect",
    icon: "📸",
    items: [
      { href: "/inbox", labelKey: "nav.inbox" },
    ],
  },
  {
    labelKey: "nav.track",
    icon: "📈",
    items: [
      { href: "/shield", labelKey: "nav.zioshield" },
      { href: "/success", labelKey: "nav.success" },
      { href: "/blacklist", labelKey: "nav.blacklist" },
    ],
  },
] as const

interface Props {
  orgName: string
  planName: string
  orgId: string
  completedCount: number
}

export default function SidebarNav({ orgName, planName, orgId, completedCount }: Props) {
  const { t } = useLanguage()
  const showOnboarding = completedCount < 4

  return (
    <aside className="hidden w-56 border-r border-zinc-800 p-4 sm:flex sm:flex-col">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white">U</span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              UGZIO
            </span>
          </Link>
          {orgName && (
            <p className="mt-1 truncate text-xs text-zinc-600">
              {orgName} · {planName}
            </p>
          )}
        </div>
        <NotificationBell orgId={orgId} />
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        <Link
          href="/"
          className="mb-3 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-200"
        >
          {t("nav.dashboard")}
        </Link>
        {PILLARS.map((pillar) => (
          <div key={pillar.labelKey} className="mb-3">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              {pillar.icon} {t(pillar.labelKey)}
            </p>
            <div className="flex flex-col gap-0.5">
              {pillar.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      {showOnboarding && (
        <div className="pt-4 border-t border-zinc-800">
          <Link
            href="/onboarding"
            className="block rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/30"
          >
            {t("nav.onboarding").replace("{n}", String(completedCount))}
          </Link>
        </div>
      )}
    </aside>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "../../../app/context/LanguageContext"
import NotificationBell from "./NotificationBell"

const PILLARS = [
  {
    key: "activate",
    labelKey: "nav.activate",
    icon: "📤",
    accent: "green",
    items: [
      { href: "/orders", labelKey: "nav.orders" },
      { href: "/orders/new", labelKey: "nav.new-order" },
      { href: "/confirm", labelKey: "nav.confirm" },
    ],
  },
  {
    key: "collect",
    labelKey: "nav.collect",
    icon: "📸",
    accent: "amber",
    items: [
      { href: "/inbox", labelKey: "nav.inbox" },
    ],
  },
  {
    key: "track",
    labelKey: "nav.track",
    icon: "📈",
    accent: "orange",
    items: [
      { href: "/shield", labelKey: "nav.zioshield" },
      { href: "/success", labelKey: "nav.success" },
      { href: "/blacklist", labelKey: "nav.blacklist" },
    ],
  },
] as const

const ACCENT_CLASSES: Record<string, { active: string }> = {
  green: { active: "bg-green-500/10 text-green-400" },
  amber: { active: "bg-amber-500/10 text-amber-400" },
  orange: { active: "bg-orange-500/10 text-orange-400" },
}

interface Props {
  orgName: string
  planName: string
  orgId: string
  completedCount: number
}

export default function SidebarNav({ orgName, planName, orgId, completedCount }: Props) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const showOnboarding = completedCount < 4

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden w-52 border-r border-zinc-800/40 bg-zinc-950/50 p-3 sm:flex sm:flex-col">
      <div className="mb-5 flex items-center justify-between px-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500 text-[10px] font-bold text-white">U</span>
          <span className="text-sm font-bold text-zinc-100">UGZIO</span>
        </Link>
        <NotificationBell orgId={orgId} />
      </div>
      <nav className="flex flex-col gap-3 flex-1">
        <Link
          href="/"
          className={`rounded-md px-2 py-1.5 text-sm transition ${
            pathname === "/"
              ? "bg-zinc-800/40 text-zinc-100 font-medium"
              : "text-zinc-500 hover:bg-zinc-800/20 hover:text-zinc-300"
          }`}
        >
          {t("nav.dashboard")}
        </Link>
        {PILLARS.map((pillar) => {
          const hasActive = pillar.items.some((i) => isActive(i.href))
          const ac = ACCENT_CLASSES[pillar.accent]
          return (
            <div key={pillar.key}>
              <p className="mb-0.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                {pillar.icon} {t(pillar.labelKey)}
              </p>
              <div className="flex flex-col gap-px">
                {pillar.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-md px-2 py-1.5 text-sm transition ${
                        active
                          ? `${ac.active} font-medium`
                          : "text-zinc-500 hover:bg-zinc-800/20 hover:text-zinc-300"
                      }`}
                    >
                      {t(item.labelKey)}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
      {showOnboarding && (
        <div className="pt-3 border-t border-zinc-800/40">
          <Link
            href="/onboarding"
            className="block rounded-md bg-green-500/10 px-2 py-1.5 text-xs font-medium text-green-400 transition hover:bg-green-500/20"
          >
            {t("nav.onboarding").replace("{n}", String(completedCount))}
          </Link>
        </div>
      )}
      <div className="pt-3 border-t border-zinc-800/40 mt-3">
        <p className="truncate px-2 text-xs text-zinc-600">{orgName}</p>
        <p className="px-2 text-[10px] text-zinc-700">{planName}</p>
      </div>
    </aside>
  )
}

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
    <aside className="hidden w-52 border-r border-zinc-800/40 bg-zinc-950/50 p-3 sm:flex sm:flex-col">
      <div className="mb-5 flex items-center justify-between px-2">
        <Link href="/overview" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-600 text-[10px] font-bold text-white">U</span>
          <span className="text-sm font-bold text-zinc-100">UGZIO</span>
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
                  ? "bg-purple-600/20 text-purple-400 font-medium"
                  : "text-zinc-500 hover:bg-zinc-800/20 hover:text-zinc-300"
              }`}
            >
              {item.icon} {t(item.labelKey)}
            </Link>
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
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
            window.location.href = "/login"
          }}
          className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-xs text-zinc-600 transition hover:text-red-400"
        >
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  )
}

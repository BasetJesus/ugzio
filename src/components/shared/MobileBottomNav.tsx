"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "../../../app/context/LanguageContext"

const ITEMS = [
  { href: "/", labelKey: "nav.dashboard", icon: "📊" },
  { href: "/orders", labelKey: "nav.activate", icon: "📤", accent: "text-green-400" },
  { href: "/inbox", labelKey: "nav.inbox", icon: "📸", accent: "text-amber-400" },
  { href: "/shield", labelKey: "nav.track", icon: "📈", accent: "text-orange-400" },
  { href: "/success", labelKey: "nav.success", icon: "🏆", accent: "text-orange-400" },
] as const

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/40 bg-zinc-950 sm:hidden">
      <div className="flex items-center justify-around">
        {ITEMS.map((item: any) => {
          const isActive = pathname === item.href
          const activeColor = item.accent ?? "text-green-400"
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition ${
                isActive ? activeColor : "text-zinc-600"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"

const ITEMS = [
  { href: "/overview", labelKey: "nav.overview", icon: "⌘", accent: "text-purple-400" },
  { href: "/confirm", labelKey: "nav.confirm", icon: "✅", accent: "text-green-400" },
  { href: "/orders", labelKey: "nav.orders", icon: "📦", accent: "text-blue-400" },
  { href: "#logout", labelKey: "nav.logout", icon: "🚪", accent: "text-zinc-600" },
] as const

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    window.location.href = "/login"
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/40 bg-zinc-950 sm:hidden">
      <div className="flex items-center justify-around">
        {ITEMS.map((item: any) => {
          const isActive = pathname === item.href
          const activeColor = item.accent ?? "text-purple-400"

          if (item.href === "#logout") {
            return (
              <button
                key={item.href}
                onClick={handleLogout}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition ${
                  isActive ? activeColor : "text-zinc-600"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </button>
            )
          }

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

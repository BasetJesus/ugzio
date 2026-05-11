"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/orders", label: "Orders", icon: "📦" },
  { href: "/inbox", label: "Inbox", icon: "💬" },
  { href: "/shield", label: "Shield", icon: "🛡️" },
  { href: "/success", label: "Success", icon: "📈" },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black sm:hidden">
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition ${
                isActive ? "text-purple-400" : "text-zinc-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

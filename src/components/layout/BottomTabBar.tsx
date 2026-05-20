"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShieldAlert, CheckCircle, MessageSquare, Package } from "lucide-react"

const TABS = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/shield", label: "Protect", icon: ShieldAlert },
  { href: "/confirm", label: "Confirm", icon: CheckCircle },
  { href: "/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/orders", label: "Orders", icon: Package },
]

export default function BottomTabBar({
  pendingCount = 0,
  highRiskCount = 0,
}: {
  pendingCount?: number
  highRiskCount?: number
}) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t md:hidden"
      style={{ backgroundColor: "#161A23", borderTopColor: "rgba(255,255,255,0.06)" }}
    >
      {TABS.map((item) => {
        const Icon = item.icon
        const active =
          item.href === "/overview"
            ? pathname === "/overview"
            : pathname === item.href || pathname.startsWith(item.href + "/")
        const badge =
          item.href === "/confirm"
            ? pendingCount
            : item.href === "/shield"
              ? highRiskCount
              : 0

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center justify-center gap-0.5"
            style={{ width: 56 }}
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: active ? "rgba(255,215,0,0.15)" : "transparent" }}
            >
              <Icon size={18} style={{ color: active ? "#FFD700" : "#6B7280" }} />
            </div>
            <span
              className="text-[9px] font-medium leading-none"
              style={{ color: active ? "#FFD700" : "#6B7280" }}
            >
              {item.label}
            </span>
            {badge > 0 && (
              <span
                className="absolute -top-0.5 right-1 flex min-w-[14px] h-[14px] items-center justify-center rounded-full px-[3px] text-[8px] font-bold"
                style={{ backgroundColor: "#FFD700", color: "#0B0D12" }}
              >
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

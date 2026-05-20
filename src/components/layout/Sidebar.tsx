"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShieldAlert,
  CheckCircle,
  MessageSquare,
  Package,
  Image,
  TrendingUp,
  Brain,
  Users,
  Settings,
  Crown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import UGZIOLogo from "@/components/brand/UGZIOLogo"
import { useSidebar } from "@/hooks/useSidebar"

interface SidebarProps {
  planName?: string
  pendingCount?: number
  highRiskCount?: number
  ugcPendingCount?: number
}

function Badge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-[#FFD700] px-1.5 h-5 text-[10px] font-bold text-[#0B0D12]">
      {count > 99 ? "99+" : count}
    </span>
  )
}

export default function Sidebar({
  planName = "ZioPro",
  pendingCount = 0,
  highRiskCount = 0,
  ugcPendingCount = 0,
}: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggle } = useSidebar()

  const isActive = (href: string) => {
    if (href === "/overview") return pathname === "/overview"
    return pathname === href || pathname.startsWith(href + "/")
  }

  interface NavEntry {
    href: string
    label: string
    icon: React.ElementType
    badge?: number
  }

  const mainNav: NavEntry[] = [
    { href: "/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/shield", label: "Protect", icon: ShieldAlert, badge: highRiskCount },
    { href: "/confirm", label: "Confirm", icon: CheckCircle, badge: pendingCount },
    { href: "/inbox", label: "Inbox", icon: MessageSquare, badge: ugcPendingCount },
    { href: "/orders", label: "Orders", icon: Package },
    { href: "/capture", label: "UGC & Captions", icon: Image },
    { href: "/growth", label: "Analytics", icon: TrendingUp },
    { href: "/stats", label: "ZioBrain", icon: Brain },
    { href: "/orders", label: "Customers", icon: Users },
  ]

  const collapsed = isCollapsed

  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r md:flex transition-all duration-200 ease-out"
      style={{
        width: collapsed ? 64 : 192,
        borderRightColor: "rgba(255,255,255,0.06)",
        backgroundColor: "#161A23",
      }}
    >
      {/* ── Logo + toggle ── */}
      <div
        className="flex h-16 items-center shrink-0"
        style={{ paddingLeft: collapsed ? 16 : 16, paddingRight: collapsed ? 8 : 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <UGZIOLogo size="sm" />
          {!collapsed && <span className="text-[15px] font-bold text-white truncate">UGZIO</span>}
        </div>
        <button
          onClick={toggle}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-[#2A303C] shrink-0 max-lg:hidden"
          style={{ color: "#6B7280" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* ── Navigation items ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {mainNav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <li key={item.label} className={active ? "sidebar-active" : "group relative"}>
                <Link
                  href={item.href}
                  className={`flex h-10 items-center rounded-lg transition-colors ${
                    active ? "bg-[#FFD700] font-bold" : "hover:bg-[#2A303C]"
                  }`}
                  style={{
                    color: active ? "#0B0D12" : "#9CA3AF",
                    justifyContent: collapsed ? "center" : "flex-start",
                    paddingLeft: collapsed ? 0 : 12,
                    paddingRight: collapsed ? 0 : 12,
                    gap: collapsed ? 0 : 10,
                  }}
                >
                  <div className="flex items-center justify-center shrink-0" style={{ width: collapsed ? 40 : 18 }}>
                    <Icon size={18} style={{ color: active ? "#0B0D12" : "#9CA3AF" }} />
                  </div>
                  {!collapsed && (
                    <>
                      <span className="truncate text-[13px]">{item.label}</span>
                      {item.badge != null && <Badge count={item.badge} />}
                    </>
                  )}
                </Link>
                {/* Tooltip on hover when collapsed */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: "#2A303C", color: "#FFFFFF" }}
                  >
                    {item.label}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Revenue widget ── */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="rounded-xl p-3" style={{ backgroundColor: "#0B0D12" }}>
            <p className="text-[10px] font-medium" style={{ color: "#9CA3AF" }}>
              Revenue Protected
            </p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-base font-bold text-white">1,248.750 DTN</p>
              <svg width="60" height="22" viewBox="0 0 60 22" className="shrink-0">
                <path
                  d="M 0 18 L 8 16 L 16 17 L 24 11 L 32 14 L 40 7 L 48 10 L 54 4 L 60 2"
                  stroke="#FFD700"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-0.5 text-[11px]">
              <span className="font-semibold" style={{ color: "#22C55E" }}>+18.6%</span>{" "}
              <span style={{ color: "#6B7280" }}>vs yesterday</span>
            </p>
          </div>
        </div>
      )}

      {/* ── Plan badge ── */}
      {!collapsed && (
        <div className="px-3 pb-4">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-[10px]" style={{ backgroundColor: "#2A303C" }}>
            <Crown size={16} fill="#FFD700" color="#FFD700" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white truncate">{planName} Plan</p>
              <p className="text-[10px]" style={{ color: "#6B7280" }}>Renews in 18 days</p>
            </div>
            <ChevronRight size={14} style={{ color: "#6B7280" }} />
          </div>
        </div>
      )}

      {/* ── Settings ── */}
      <div className="border-t px-3 py-2" style={{ borderTopColor: "rgba(255,255,255,0.06)" }}>
        <Link
          href="/settings"
          className={`group relative flex h-10 items-center rounded-lg transition-colors ${
            isActive("/settings") ? "bg-[#FFD700] font-bold" : "hover:bg-[#2A303C]"
          }`}
          style={{
            color: isActive("/settings") ? "#0B0D12" : "#9CA3AF",
            justifyContent: collapsed ? "center" : "flex-start",
            paddingLeft: collapsed ? 0 : 12,
            paddingRight: collapsed ? 0 : 12,
            gap: collapsed ? 0 : 10,
          }}
        >
          <div className="flex items-center justify-center shrink-0" style={{ width: collapsed ? 40 : 18 }}>
            <Settings size={18} style={{ color: isActive("/settings") ? "#0B0D12" : "#9CA3AF" }} />
          </div>
          {!collapsed && <span className="truncate text-[13px]">Settings</span>}
          {collapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              style={{ backgroundColor: "#2A303C", color: "#FFFFFF" }}
            >
              Settings
            </div>
          )}
        </Link>
      </div>
    </aside>
  )
}

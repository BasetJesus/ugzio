"use client"

import { Bell, Search, Calendar, ChevronDown } from "lucide-react"

interface HeaderProps {
  title: string
  emoji?: string
  subtitle?: string
  userName?: string
  shopName?: string
  notificationCount?: number
  actions?: React.ReactNode
}

function formatToday(): string {
  const d = new Date()
  const month = d.toLocaleDateString("en-US", { month: "short" })
  const day = d.getDate()
  return `Today, ${month} ${day}`
}

export default function Header({
  title,
  emoji,
  subtitle,
  userName = "User",
  shopName = "Store",
  notificationCount = 0,
  actions,
}: HeaderProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header
      className="sticky top-0 z-10 flex h-16 items-center justify-between px-5 sm:px-8"
      style={{ backgroundColor: "#0B0D12", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* ── Left: title area ── */}
      <div className="flex flex-col min-w-0 mr-4">
        <h1 className="truncate text-[22px] sm:text-[26px] font-bold text-white leading-tight tracking-[-0.02em]">
          {title}
          {emoji ? ` ${emoji}` : ""}
        </h1>
        {subtitle && (
          <p className="text-[13px] mt-0.5 truncate" style={{ color: "#6B7280" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Right: controls ── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search */}
        <div
          className="hidden md:flex h-9 w-[280px] items-center gap-2 rounded-lg border px-3"
          style={{ backgroundColor: "#161A23", borderColor: "#2A303C" }}
        >
          <Search size={16} style={{ color: "#6B7280" }} />
          <input
            type="text"
            placeholder="Search orders, buyers, UGC..."
            className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-[#6B7280]"
          />
          <span
            className="flex h-5 items-center rounded px-2 text-[10px] font-medium"
            style={{ backgroundColor: "#2A303C", color: "#6B7280" }}
          >
            ⌘K
          </span>
        </div>

        {/* Date picker */}
        <button
          className="hidden sm:flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] text-white"
          style={{ backgroundColor: "#161A23", borderColor: "#2A303C" }}
        >
          <Calendar size={16} style={{ color: "#6B7280" }} />
          <span className="whitespace-nowrap">{formatToday()}</span>
          <ChevronDown size={14} style={{ color: "#6B7280" }} />
        </button>

        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: "#161A23" }}
        >
          <Bell size={18} className="text-white" />
          {notificationCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none"
              style={{ backgroundColor: "#FFD700", color: "#0B0D12" }}
            >
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        {/* User profile */}
        <div
          className="hidden sm:flex h-11 items-center gap-2.5 rounded-lg border px-3"
          style={{ backgroundColor: "#161A23", borderColor: "#2A303C" }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold shrink-0"
            style={{ backgroundColor: "#FFD700", color: "#0B0D12" }}
          >
            {initials}
          </div>
          <div className="flex flex-col leading-tight">
            <p className="text-[13px] font-bold text-white">{userName}</p>
            <p className="text-[11px]" style={{ color: "#6B7280" }}>{shopName}</p>
          </div>
          <ChevronDown size={14} style={{ color: "#6B7280" }} />
        </div>

        {actions}
      </div>
    </header>
  )
}

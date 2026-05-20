"use client"

import type { ReactNode } from "react"
import { AlertTriangle, Send, Check, Image, Ban, Zap } from "lucide-react"

/* ── Types ── */

export interface ActivityItem {
  id: string
  type: "high_risk" | "confirmation_sent" | "customer_replied" | "ugc_received" | "blacklisted"
  text: string
  time: string
  icon: ReactNode
  iconBg: string
}

/* ── Mock data ── */

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    type: "high_risk",
    text: "Order marked as high risk",
    time: "2 min ago",
    icon: <AlertTriangle size={15} color="#EF4444" />,
    iconBg: "rgba(239,68,68,0.15)",
  },
  {
    id: "2",
    type: "confirmation_sent",
    text: "Confirmation sent to +216 50 123 456",
    time: "8 min ago",
    icon: <Send size={15} color="#3B82F6" />,
    iconBg: "rgba(59,130,246,0.15)",
  },
  {
    id: "3",
    type: "customer_replied",
    text: "Customer replied ✅ Order confirmed",
    time: "15 min ago",
    icon: <Check size={15} color="#22C55E" />,
    iconBg: "rgba(34,197,94,0.15)",
  },
  {
    id: "4",
    type: "ugc_received",
    text: "UGC received from @ines.style",
    time: "32 min ago",
    icon: <Image size={15} color="#8B5CF6" />,
    iconBg: "rgba(139,92,246,0.15)",
  },
  {
    id: "5",
    type: "blacklisted",
    text: "Blacklisted phone detected +216 98 765 432",
    time: "1h ago",
    icon: <Ban size={15} color="#EF4444" />,
    iconBg: "rgba(239,68,68,0.15)",
  },
  {
    id: "6",
    type: "confirmation_sent",
    text: "Confirmation sent to +216 55 987 654",
    time: "1h ago",
    icon: <Send size={15} color="#3B82F6" />,
    iconBg: "rgba(59,130,246,0.15)",
  },
]

/* ── Component ── */

interface RecentActivityProps {
  activities?: ActivityItem[]
}

export default function RecentActivity({ activities = MOCK_ACTIVITIES }: RecentActivityProps) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-bold text-white">Recent Activity</h3>
        <button className="text-[12px] font-medium transition-opacity hover:opacity-80" style={{ color: "#FFD700" }}>
          View all &rsaquo;
        </button>
      </div>

      {/* ── Timeline ── */}
      <div className="relative">
        {activities.map((item, idx) => (
          <div
            key={item.id}
            className="relative flex items-start gap-3 pb-4 animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: "backwards" }}
          >
            {/* Connecting line */}
            {idx < activities.length - 1 && (
              <div
                className="absolute left-[15px] top-8 w-px"
                style={{
                  height: "calc(100% + 4px)",
                  background: "linear-gradient(180deg, #FFD700 0%, rgba(255,215,0,0) 100%)",
                }}
              />
            )}

            {/* Dot + icon */}
            <div className="relative z-10 flex flex-col items-center shrink-0">
              {/* Yellow dot */}
              <div className="w-2 h-2 rounded-full bg-[#FFD700] mb-1.5" />
              {/* Icon circle */}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: item.iconBg }}
              >
                {item.icon}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] text-white truncate">{item.text}</p>
                <span className="text-[11px] shrink-0" style={{ color: "#6B7280" }}>
                  {item.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ZioBrain CTA ── */}
      <div
        className="mt-2 rounded-xl border p-4"
        style={{ backgroundColor: "#0B0D12", borderColor: "rgba(255,215,0,0.15)" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: "rgba(255,215,0,0.15)" }}
          >
            <Zap size={18} color="#FFD700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white">Let ZioBrain work for you</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>
              Enable auto-interventions and AI suggestions.
            </p>
            <button
              className="mt-2.5 rounded-lg px-4 py-1.5 text-[12px] font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#FFD700", color: "#0B0D12" }}
            >
              Activate ZioBrain &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

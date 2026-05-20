"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

/* ── Channel Performance Types ── */

interface ChannelMetric {
  id: string
  platform: "instagram" | "whatsapp" | "tiktok"
  name: string
  value: string
  pct: number
  change: number
}

const CHANNELS: ChannelMetric[] = [
  { id: "ig", platform: "instagram", name: "Instagram", value: "44.2K", pct: 78, change: 18.6 },
  { id: "wa", platform: "whatsapp", name: "WhatsApp", value: "28.7K", pct: 54, change: 12.3 },
  { id: "tt", platform: "tiktok", name: "TikTok", value: "12.4K", pct: 31, change: -4.2 },
]

const PLATFORM_STYLES: Record<string, { iconBg: string; iconText: string; barColor: string }> = {
  instagram: { iconBg: "linear-gradient(135deg, #E1306C, #F77737)", iconText: "Ig", barColor: "#E1306C" },
  whatsapp: { iconBg: "#25D366", iconText: "Wa", barColor: "#25D366" },
  tiktok: { iconBg: "#69C9D0", iconText: "Tk", barColor: "#69C9D0" },
}

/* ── Top Captions Types ── */

interface CaptionItem {
  id: string
  imageUrl: string
  text: string
  engagement: string
  trend: "up" | "down"
  change: number
}

const CAPTIONS: CaptionItem[] = [
  {
    id: "c1",
    imageUrl: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=80&h=80&fit=crop",
    text: "This look gave me all the feels 🖤 Perfect for those who love minimalist style with a touch of edge.",
    engagement: "12.4K",
    trend: "up",
    change: 24.3,
  },
  {
    id: "c2",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=80&h=80&fit=crop",
    text: "Summer essentials that actually work ☀️ From beach days to rooftop nights.",
    engagement: "8.7K",
    trend: "up",
    change: 15.8,
  },
  {
    id: "c3",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
    text: "The sneaker rotation is real this season 👟 Which one is your favorite?",
    engagement: "6.2K",
    trend: "down",
    change: -3.1,
  },
]

/* ── ChannelPerformance ── */

interface ChannelPerformanceProps {
  channels?: ChannelMetric[]
}

export function ChannelPerformance({ channels = CHANNELS }: ChannelPerformanceProps) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-white">Channel Performance</h3>
        <button className="text-[12px] font-medium transition-opacity hover:opacity-80" style={{ color: "#FFD700" }}>
          View all &rsaquo;
        </button>
      </div>

      <div className="space-y-3">
        {channels.map((ch) => {
          const style = PLATFORM_STYLES[ch.platform]
          return (
            <div key={ch.id} className="flex items-center gap-3" style={{ height: 44 }}>
              {/* Platform icon */}
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold shrink-0"
                style={{ background: style.iconBg, color: "white" }}
              >
                {style.iconText}
              </div>

              {/* Platform name */}
              <span className="text-[13px] text-white w-16 shrink-0">{ch.name}</span>

              {/* Progress bar */}
              <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: "#2A303C" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${ch.pct}%`, background: style.barColor }}
                />
              </div>

              {/* Value */}
              <span className="text-[13px] font-bold text-white w-16 text-right">{ch.value}</span>

              {/* Change */}
              <span
                className="text-[11px] font-semibold w-12 text-right"
                style={{ color: ch.change >= 0 ? "#22C55E" : "#EF4444" }}
              >
                {ch.change >= 0 ? "+" : ""}{ch.change.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── TopCaptions ── */

interface TopCaptionsProps {
  captions?: CaptionItem[]
}

export function TopCaptions({ captions = CAPTIONS }: TopCaptionsProps) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-white">🚀 Top Performing Captions</h3>
        <button className="text-[12px] font-medium transition-opacity hover:opacity-80" style={{ color: "#FFD700" }}>
          View all &rsaquo;
        </button>
      </div>

      <div className="space-y-3">
        {captions.map((cap) => (
          <div
            key={cap.id}
            className="flex items-center gap-3 py-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            {/* Thumbnail */}
            <img
              src={cap.imageUrl}
              alt=""
              className="h-10 w-10 rounded-lg object-cover shrink-0"
              loading="lazy"
            />

            {/* Caption text */}
            <p className="flex-1 text-[13px] text-white leading-snug line-clamp-2 min-w-0">
              {cap.text}
            </p>

            {/* Engagement */}
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[13px] font-bold text-white">{cap.engagement}</span>
              <span
                className="flex items-center gap-0.5 text-[11px] font-semibold"
                style={{ color: cap.trend === "up" ? "#22C55E" : "#EF4444" }}
              >
                {cap.trend === "up" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {cap.change >= 0 ? "+" : ""}{cap.change.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
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

/* ── ChannelPerformance ── */

interface ChannelPerformanceProps {
  channels?: ChannelMetric[]
  href?: string
}

export function ChannelPerformance({ channels = [], href = "/growth" }: ChannelPerformanceProps) {
  const card = (
    <div
      className="rounded-xl border p-5 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-white">📊 Channel Performance</h3>
        <span className="text-[12px] font-medium" style={{ color: "#FFD700" }}>
          View all &rsaquo;
        </span>
      </div>

      {channels.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <span className="text-[13px]" style={{ color: "#6B7280" }}>No channel data yet</span>
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((ch) => {
            const style = PLATFORM_STYLES[ch.platform]
            return (
              <div key={ch.id} className="flex items-center gap-3" style={{ height: 44 }}>
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold shrink-0"
                  style={{ background: style.iconBg, color: "white" }}
                >
                  {style.iconText}
                </div>

                <span className="text-[13px] text-white w-16 shrink-0">{ch.name}</span>

                <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: "#2A303C" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${ch.pct}%`, background: style.barColor }}
                  />
                </div>

                <span className="text-[13px] font-bold text-white w-16 text-right">{ch.value}</span>

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
      )}
    </div>
  )

  return <Link href={href} className="block">{card}</Link>
}

/* ── TopCaptions ── */

interface TopCaptionsProps {
  captions?: CaptionItem[]
  href?: string
}

export function TopCaptions({ captions = [], href = "/capture" }: TopCaptionsProps) {
  const card = (
    <div
      className="rounded-xl border p-5 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-white">🚀 Top Performing Captions</h3>
        <span className="text-[12px] font-medium" style={{ color: "#FFD700" }}>
          View all &rsaquo;
        </span>
      </div>

      {captions.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <span className="text-[13px]" style={{ color: "#6B7280" }}>No captions yet</span>
        </div>
      ) : (
        <div className="space-y-3">
          {captions.map((cap) => (
            <div
              key={cap.id}
              className="flex items-center gap-3 py-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <img
                src={cap.imageUrl}
                alt=""
                className="h-10 w-10 rounded-lg object-cover shrink-0"
                loading="lazy"
              />

              <p className="flex-1 text-[13px] text-white leading-snug line-clamp-2 min-w-0">
                {cap.text}
              </p>

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
      )}
    </div>
  )

  return <Link href={href} className="block">{card}</Link>
}

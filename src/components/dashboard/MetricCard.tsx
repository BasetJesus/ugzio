"use client"

import { memo } from "react"
import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"
import { useCountUp } from "@/hooks/useCountUp"

interface MetricCardProps {
  label: string
  value: string | number
  change: number
  changeLabel?: string
  icon: ReactNode
  variant: "large" | "small"
  color?: string
  sparklineData?: number[]
  action?: ReactNode
  invertColor?: boolean
}

function changeColor(change: number, invert?: boolean): string {
  const positive = invert ? change < 0 : change > 0
  if (change === 0) return "#6B7280"
  return positive ? "#22C55E" : "#EF4444"
}

function formatChange(change: number): string {
  const sign = change > 0 ? "+" : ""
  return `${sign}${change.toFixed(1)}%`
}

function SparklinePath({ data, color, height, asBackground }: { data: number[]; color: string; height: number; asBackground?: boolean }) {
  if (data.length < 2) return null

  const w = 100
  const h = height
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 6) - 3
    return `${x},${y}`
  })

  const lineD = `M ${points.join(" L ")}`

  return (
    <>
      <path
        d={lineD}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={2000}
        strokeDashoffset={0}
        className="sparkline-path"
        style={{ animation: "drawLine 600ms ease-out forwards" }}
      />
      {asBackground && (
        <path
          d={`${lineD} L ${w},${h} L 0,${h} Z`}
          fill={`url(#sparkline-grad)`}
          opacity={0.15}
        />
      )}
    </>
  )
}

const MetricCard = memo(function MetricCard({
  label,
  value,
  change,
  changeLabel = "vs yesterday",
  icon,
  variant,
  color,
  sparklineData,
  action,
  invertColor,
}: MetricCardProps) {
  const chgColor = color || changeColor(change, invertColor)
  const numValue = typeof value === "number" ? value : 0
  const counted = useCountUp(numValue, 1000)
  const displayValue = typeof value === "number" ? counted.toLocaleString("fr-FR") : value

  return (
    <div
      className="group relative rounded-xl border p-5 min-h-[120px] transition-all duration-200 ease-out"
      style={{
        backgroundColor: "#161A23",
        borderColor: "rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,215,0,0.3)"
        e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.08)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      {/* ── Hover glow ── */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          boxShadow: `0 0 20px ${chgColor}15, 0 0 40px ${chgColor}08`,
          border: "1px solid #FFD700",
        }}
      />

      {/* ── LARGE VARIANT ── */}
      {variant === "large" && (
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,215,0,0.15)" }}
              >
                {icon}
              </div>
              <span className="text-[12px] font-medium" style={{ color: "#6B7280" }}>
                {label}
              </span>
            </div>
            {action ? (
              action
            ) : (
              <button className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "#6B7280" }}>
                Today <ChevronDown size={12} />
              </button>
            )}
          </div>

          <div className="mt-2">
            <p className="text-[32px] font-bold tracking-[-0.03em] text-white leading-none">
              {displayValue}
            </p>
            <p className="mt-1.5 text-[12px]">
              <span className="font-semibold" style={{ color: chgColor }}>
                {formatChange(change)}
              </span>{" "}
              <span style={{ color: "#6B7280" }}>{changeLabel}</span>
            </p>
          </div>

          {sparklineData && sparklineData.length >= 2 && (
            <div className="mt-auto pt-3">
              <svg viewBox="0 0 100 36" className="w-full h-9" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chgColor} />
                    <stop offset="100%" stopColor={chgColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <SparklinePath data={sparklineData} color={chgColor} height={36} asBackground />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* ── SMALL VARIANT ── */}
      {variant === "small" && (
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
              style={{ backgroundColor: `${chgColor}18` }}
            >
              {icon}
            </div>
            <span className="text-[12px] font-medium truncate" style={{ color: "#6B7280" }}>
              {label}
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between">
            <div>
              <p className="text-[28px] font-bold tracking-[-0.03em] text-white leading-none">
                {displayValue}
              </p>
              <p className="mt-1 text-[12px]">
                <span className="font-semibold" style={{ color: chgColor }}>
                  {formatChange(change)}
                </span>{" "}
                <span style={{ color: "#6B7280" }}>{changeLabel}</span>
              </p>
            </div>
            {sparklineData && sparklineData.length >= 2 && (
              <svg viewBox="0 0 60 28" className="w-16 h-7 shrink-0 ml-2" preserveAspectRatio="none">
                <SparklinePath data={sparklineData} color={chgColor} height={28} />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

export default MetricCard

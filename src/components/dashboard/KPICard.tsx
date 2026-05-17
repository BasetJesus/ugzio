"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion } from "framer-motion"

type RiskTier = "high" | "medium" | "low" | "neutral"

interface Props {
  label: string
  value: string | number
  tier?: RiskTier
  trend?: { direction: "up" | "down"; pct: number }
  children?: ReactNode
  onClick?: () => void
}

const tierColors: Record<RiskTier, { border: string; text: string; glow: string }> = {
  high: { border: "var(--status-danger)", text: "var(--status-danger)", glow: "rgba(239,68,68,0.1)" },
  medium: { border: "var(--status-warning)", text: "var(--status-warning)", glow: "rgba(245,158,11,0.1)" },
  low: { border: "var(--status-success)", text: "var(--status-success)", glow: "rgba(16,185,129,0.1)" },
  neutral: { border: "var(--border)", text: "var(--text-primary)", glow: "rgba(255,255,255,0.03)" },
}

export default function KPICard({ label, value, tier = "neutral", trend, children, onClick }: Props) {
  const colors = tierColors[tier]
  const [displayValue, setDisplayValue] = useState(typeof value === "number" ? 0 : value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof value !== "number") return
    const start = performance.now()
    const duration = 800
    const from = 0
    const to = value

    function raf(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(from + (to - from) * eased))
      if (progress < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [value])

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="relative min-h-[120px] cursor-default overflow-hidden rounded-xl border bg-[var(--bg-surface)] p-5"
      style={{ borderLeft: `3px solid ${colors.border}` }}
      onClick={onClick}
    >
      {trend && (
        <span
          className="absolute right-3 top-3 flex items-center gap-1 text-[10px] font-medium"
          style={{ color: trend.direction === "up" ? "var(--status-success)" : "var(--status-danger)" }}
        >
          {trend.direction === "up" ? "↑" : "↓"} {trend.pct}%
        </span>
      )}
      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight" style={{ color: colors.text }}>
        {displayValue}
      </p>
      {children}
      <div className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 opacity-0 hover:opacity-100"
        style={{ boxShadow: `inset 0 0 20px ${colors.glow}` }}
      />
    </motion.div>
  )
}

export function MiniKpiCard({ label, value, tier = "neutral", }: { label: string; value: string | number; tier?: RiskTier }) {
  const colors = tierColors[tier]
  return (
    <div
      className="rounded-xl border bg-[var(--bg-surface)] p-3"
      style={{ borderLeft: `2px solid ${colors.border}` }}
    >
      <p className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
      <p className="mt-0.5 text-base font-bold" style={{ color: colors.text }}>{value}</p>
    </div>
  )
}

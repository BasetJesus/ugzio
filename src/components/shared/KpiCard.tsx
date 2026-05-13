import type { ReactNode } from "react"

type RiskTier = "high" | "medium" | "low" | "neutral"

interface Props {
  label: string
  value: string | number
  tier?: RiskTier
  children?: ReactNode
}

const tierStyles: Record<RiskTier, string> = {
  high: "border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)]",
  medium: "border-[var(--warning-amber-border)] bg-[var(--warning-amber-bg)]",
  low: "border-[var(--success-green-border)] bg-[var(--success-green-bg)]",
  neutral: "border-[var(--border)] bg-[var(--bg-card)]",
}

const valueColors: Record<RiskTier, string> = {
  high: "text-[var(--risk-red)]",
  medium: "text-[var(--warning-amber)]",
  low: "text-[var(--success-green)]",
  neutral: "text-[var(--text-primary)]",
}

export default function KpiCard({ label, value, tier = "neutral", children }: Props) {
  return (
    <div className={`rounded-xl border p-card sm:p-panel ${tierStyles[tier]}`}>
      <p className="text-caption text-[var(--text-tertiary)]">{label}</p>
      <p className={`text-display mt-1 ${valueColors[tier]}`}>{value}</p>
      {children}
    </div>
  )
}

export function MiniKpiCard({ label, value, tier = "neutral" }: Props) {
  return (
    <div className={`rounded-xl border p-card ${tierStyles[tier]}`}>
      <p className="text-caption text-[var(--text-tertiary)]">{label}</p>
      <p className={`text-base font-semibold mt-0.5 ${valueColors[tier]}`}>{value}</p>
    </div>
  )
}

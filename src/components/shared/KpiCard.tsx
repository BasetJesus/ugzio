import type { ReactNode } from "react"

type RiskTier = "high" | "medium" | "low" | "neutral"

interface Props {
  label: string
  value: string | number
  icon?: string
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

const labelColors: Record<RiskTier, string> = {
  high: "text-[var(--risk-red)]",
  medium: "text-[var(--warning-amber)]",
  low: "text-[var(--success-green)]",
  neutral: "text-[var(--text-tertiary)]",
}

export default function KpiCard({ label, value, icon, tier = "neutral", children }: Props) {
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${tierStyles[tier]}`}>
      {icon && (
        <div className="flex items-start justify-between">
          <span className="text-2xl">{icon}</span>
        </div>
      )}
      <p className={`mt-3 text-3xl font-bold tracking-tight ${valueColors[tier]}`}>
        {value}
      </p>
      <p className={`mt-1 text-[11px] font-medium uppercase tracking-wider opacity-70 ${labelColors[tier]}`}>
        {label}
      </p>
      {children}
    </div>
  )
}

export function MiniKpiCard({ label, value, tier = "neutral" }: Props) {
  return (
    <div className={`rounded-xl border p-4 ${tierStyles[tier]}`}>
      <p className={`text-[10px] font-medium uppercase tracking-wider opacity-70 ${labelColors[tier]}`}>
        {label}
      </p>
      <p className={`text-xl font-bold mt-1 ${valueColors[tier]}`}>
        {value}
      </p>
    </div>
  )
}

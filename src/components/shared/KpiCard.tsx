import type { ReactNode } from "react"
import Link from "next/link"

type RiskTier = "high" | "medium" | "low" | "neutral"

type EmotionTier = "protective" | "tense" | "calm" | "achievement" | "neutral"

interface Props {
  label: string
  value: string | number
  tier?: RiskTier
  emotion?: EmotionTier
  children?: ReactNode
  onClick?: () => void
  href?: string
  shareable?: boolean
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

const emotionLabels: Record<EmotionTier, string> = {
  protective: "SAVED",
  tense: "AT RISK",
  calm: "STABLE",
  achievement: "GOAL MET",
  neutral: "",
}

export default function KpiCard({ label, value, tier = "neutral", emotion, children, onClick, href, shareable = true }: Props) {
  const interactive = onClick || href
  const content = (
    <div
      className={`relative rounded-xl border p-4 sm:p-5 overflow-hidden ${tierStyles[tier]} ${interactive ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
      onClick={onClick}
    >
      {shareable && (
        <span className="absolute top-3 right-3 text-[9px] text-[var(--text-tertiary)]/50 select-none pointer-events-none">
          🇹🇳 UGZIO
        </span>
      )}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{label}</p>
        {emotion && emotion !== "neutral" && (
          <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{emotionLabels[emotion]}</span>
        )}
      </div>
      <p className={`text-3xl sm:text-4xl font-bold tracking-[-0.03em] ${valueColors[tier]}`}>{value}</p>
      {children}
    </div>
  )
  if (href) return <Link href={href} className="block">{content}</Link>
  return content
}

export function MiniKpiCard({ label, value, tier = "neutral", href, onClick, shareable = true }: Props) {
  const interactive = onClick || href
  const content = (
    <div
      className={`relative rounded-xl border p-3 overflow-hidden ${tierStyles[tier]} ${interactive ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
      onClick={onClick}
    >
      {shareable && (
        <span className="absolute top-2 right-2 text-[7px] text-[var(--text-tertiary)]/50 select-none pointer-events-none">
          🇹🇳
        </span>
      )}
      <p className="text-[9px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{label}</p>
      <p className={`text-base font-bold mt-0.5 ${valueColors[tier]}`}>{value}</p>
    </div>
  )
  if (href) return <Link href={href} className="block">{content}</Link>
  return content
}

export function EmotionBadge({ emotion, label }: { emotion: EmotionTier; label?: string }) {
  const colors: Record<EmotionTier, string> = {
    protective: "bg-[var(--state-protected-bg)] text-[var(--success-green)] border-[var(--success-green-border)]",
    tense: "bg-[var(--state-urgent-bg)] text-[var(--risk-red)] border-[var(--kpi-red-border)]",
    calm: "bg-[var(--state-calm-bg)] text-[var(--state-calm)] border-[var(--border)]",
    achievement: "bg-[var(--state-recovering-bg)] text-[var(--warning-amber)] border-[var(--warning-amber-border)]",
    neutral: "bg-[var(--bg-card)] text-[var(--text-tertiary)] border-[var(--border)]",
  }
  return (
    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${colors[emotion]}`}>
      {label ?? emotion}
    </span>
  )
}


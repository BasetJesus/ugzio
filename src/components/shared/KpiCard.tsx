import type { ReactNode } from "react"

type RiskTier = "high" | "medium" | "low" | "neutral"

type EmotionTier = "protective" | "tense" | "calm" | "achievement" | "neutral"

interface Props {
  label: string
  value: string | number
  tier?: RiskTier
  emotion?: EmotionTier
  children?: ReactNode
  onClick?: () => void
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

const emotionGlows: Record<EmotionTier, string> = {
  protective: "shadow-[var(--glow-green)]",
  tense: "shadow-[var(--glow-red)]",
  calm: "shadow-[0_0_12px_rgba(99,102,241,0.06)]",
  achievement: "shadow-[var(--glow-amber)]",
  neutral: "",
}

const emotionIcons: Record<EmotionTier, string> = {
  protective: "\uD83D\uDEE1\uFE0F",
  tense: "\u26A1",
  calm: "\u25CB",
  achievement: "\u2B50",
  neutral: "",
}

export default function KpiCard({ label, value, tier = "neutral", emotion, children, onClick }: Props) {
  return (
    <div
      className={`rounded-xl border p-card sm:p-panel ${tierStyles[tier]} ${emotion ? emotionGlows[emotion] : ""} ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <p className="text-caption text-[var(--text-tertiary)]">{label}</p>
        {emotion && emotion !== "neutral" && (
          <span className="text-xs opacity-70">{emotionIcons[emotion]}</span>
        )}
      </div>
      <p className={`text-display mt-1 ${valueColors[tier]}`}>{value}</p>
      {children}
    </div>
  )
}

export function MiniKpiCard({ label, value, tier = "neutral", emotion }: Props) {
  return (
    <div className={`rounded-xl border p-card ${tierStyles[tier]} ${emotion ? emotionGlows[emotion] : ""}`}>
      <p className="text-caption text-[var(--text-tertiary)]">{label}</p>
      <p className={`text-base font-semibold mt-0.5 ${valueColors[tier]}`}>{value}</p>
    </div>
  )
}

export function EmotionBadge({ emotion, label }: { emotion: EmotionTier; label?: string }) {
  const colors: Record<EmotionTier, string> = {
    protective: "bg-[var(--emotion-protection)] text-[var(--success-green)] border-[var(--success-green-border)]",
    tense: "bg-[var(--emotion-tension)] text-[var(--risk-red)] border-[var(--kpi-red-border)]",
    calm: "bg-[var(--emotion-calm)] text-[var(--accent)] border-[var(--accent)]/20",
    achievement: "bg-[var(--emotion-achievement)] text-[var(--warning-amber)] border-[var(--warning-amber-border)]",
    neutral: "bg-[var(--border)] text-[var(--text-tertiary)] border-[var(--border)]",
  }
  return (
    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${colors[emotion]}`}>
      {label ?? emotion}
    </span>
  )
}

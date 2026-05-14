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
  shareable?: boolean
}

const tierStyles: Record<RiskTier, string> = {
  high: "border-red-500/20 bg-red-500/5",
  medium: "border-amber-500/20 bg-amber-500/5",
  low: "border-emerald-500/20 bg-emerald-500/5",
  neutral: "border-white/10 bg-zinc-900/50",
}

const valueColors: Record<RiskTier, string> = {
  high: "text-red-400",
  medium: "text-amber-400",
  low: "text-emerald-400",
  neutral: "text-white",
}

const emotionIcons: Record<EmotionTier, string> = {
  protective: "\uD83D\uDEE1\uFE0F",
  tense: "\u26A1",
  calm: "\u25CB",
  achievement: "\u2B50",
  neutral: "",
}

export default function KpiCard({ label, value, tier = "neutral", emotion, children, onClick, shareable = true }: Props) {
  return (
    <div
      className={`relative rounded-xl border p-4 sm:p-5 overflow-hidden ${tierStyles[tier]} ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
      onClick={onClick}
    >
      {shareable && (
        <span className="absolute top-3 right-3 text-[9px] text-white/10 select-none pointer-events-none">
          🇹🇳 UGZIO
        </span>
      )}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{label}</p>
        {emotion && emotion !== "neutral" && (
          <span className="text-sm opacity-70">{emotionIcons[emotion]}</span>
        )}
      </div>
      <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${valueColors[tier]}`}>{value}</p>
      {children}
    </div>
  )
}

export function MiniKpiCard({ label, value, tier = "neutral", emotion, shareable = true }: Props) {
  return (
    <div className={`relative rounded-xl border p-3 overflow-hidden ${tierStyles[tier]}`}>
      {shareable && (
        <span className="absolute top-2 right-2 text-[7px] text-white/10 select-none pointer-events-none">
          🇹🇳
        </span>
      )}
      <p className="text-[9px] font-medium text-white/40 uppercase tracking-wider">{label}</p>
      <p className={`text-base font-bold mt-0.5 ${valueColors[tier]}`}>{value}</p>
    </div>
  )
}

export function EmotionBadge({ emotion, label }: { emotion: EmotionTier; label?: string }) {
  const colors: Record<EmotionTier, string> = {
    protective: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    tense: "bg-red-500/10 text-red-400 border-red-500/20",
    calm: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    achievement: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    neutral: "bg-white/5 text-white/40 border-white/10",
  }
  return (
    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${colors[emotion]}`}>
      {label ?? emotion}
    </span>
  )
}

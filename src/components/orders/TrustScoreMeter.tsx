"use client"

import { getTrustBarColor } from "@/lib/risk/config"

interface Props {
  score: number
}

export default function TrustScoreMeter({ score }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${getTrustBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-semibold tabular-nums ${score >= 70 ? "text-[var(--success-green)]" : score >= 40 ? "text-[var(--warning-amber)]" : "text-[var(--risk-red)]"}`}>
        {score}
      </span>
    </div>
  )
}

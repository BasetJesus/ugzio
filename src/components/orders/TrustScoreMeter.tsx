"use client"

import { getTrustBarColor } from "@/lib/risk/config"

interface Props {
  score: number
}

export default function TrustScoreMeter({ score }: Props) {
  return (
    <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${getTrustBarColor(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}

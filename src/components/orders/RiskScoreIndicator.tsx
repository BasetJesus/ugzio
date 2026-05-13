"use client"

import type { RiskLevel } from "@/types/order"
import { RISK_META, RISK_THRESHOLDS } from "@/lib/risk/config"

interface Props {
  riskLevel: RiskLevel
  trustScore: number
}

const LOW_PCT = RISK_THRESHOLDS.LOW
const MED_PCT = RISK_THRESHOLDS.MEDIUM - RISK_THRESHOLDS.LOW
const HIGH_PCT = 100 - RISK_THRESHOLDS.MEDIUM

export default function RiskScoreIndicator({ riskLevel, trustScore }: Props) {
  const meta = RISK_META[riskLevel]
  const riskScore = 100 - trustScore

  return (
    <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-5">
      <p className="text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Risk Score</p>
      <div className="flex items-end gap-3">
        <div className={`text-4xl font-bold ${meta.color}`}>{riskScore}</div>
        <div className="pb-1">
          <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Trust: {trustScore}/100</p>
        </div>
      </div>
      <div className="mt-4 w-full h-2 rounded-full bg-[var(--border)] overflow-hidden flex">
        <div className="h-full bg-green-500" style={{ width: `${LOW_PCT}%` }} />
        <div className="h-full bg-orange-500" style={{ width: `${MED_PCT}%` }} />
        <div className="h-full bg-red-500" style={{ width: `${HIGH_PCT}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mt-1">
        <span>0</span>
        <span>{RISK_THRESHOLDS.LOW}</span>
        <span>{RISK_THRESHOLDS.MEDIUM}</span>
        <span>100</span>
      </div>
    </div>
  )
}

import type { RiskLevel } from "@/types/order"

export const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 60,
} as const

export const TRUST_THRESHOLDS = {
  LOW: 40,
  MEDIUM: 70,
} as const

export function determineRiskLevel(score: number): RiskLevel {
  if (score < RISK_THRESHOLDS.LOW) return "low"
  if (score <= RISK_THRESHOLDS.MEDIUM) return "medium"
  return "high"
}

export type TrustLevel = "low" | "medium" | "high"

export function determineTrustLevel(score: number): TrustLevel {
  if (score < TRUST_THRESHOLDS.LOW) return "low"
  if (score < TRUST_THRESHOLDS.MEDIUM) return "medium"
  return "high"
}

export const RISK_META: Record<RiskLevel, {
  label: string
  shortLabel: string
  color: string
  bg: string
  border: string
  bar: string
  dot: string
}> = {
  low:    { label: "Low Risk", shortLabel: "LOW", color: "text-green-400", bg: "bg-green-500/15", border: "border-l-green-500", bar: "bg-green-500", dot: "bg-green-500" },
  medium: { label: "Medium Risk", shortLabel: "MED", color: "text-orange-400", bg: "bg-orange-500/15", border: "border-l-orange-500", bar: "bg-orange-500", dot: "bg-amber-500" },
  high:   { label: "High Risk", shortLabel: "HIGH", color: "text-red-400", bg: "bg-red-500/15", border: "border-l-red-500", bar: "bg-red-500", dot: "bg-red-500" },
}

export const TRUST_META: Record<TrustLevel, { bar: string }> = {
  low:    { bar: "bg-red-500" },
  medium: { bar: "bg-orange-500" },
  high:   { bar: "bg-green-500" },
}

export function getTrustBarColor(score: number): string {
  return TRUST_META[determineTrustLevel(score)].bar
}

export const RISK_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

export const SIGNAL_LABELS: Record<string, string> = {
  "first-time-order": "First-time buyer",
  hesitation: "Hesitation detected",
  "prior-failures": "Prior failed orders",
  "changed-address": "Address changed",
  "no-confirm-6h": "No confirm in 6h",
  "high-amount": "High amount detected",
  "unusual-region": "Unusual region pattern",
  "payment-irregularity": "Payment irregularity",
  "device-mismatch": "Device mismatch detected",
}

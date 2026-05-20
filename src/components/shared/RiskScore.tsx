import { memo } from "react"

interface RiskScoreProps {
  score: number
  size: "table" | "detail"
}

interface TierInfo {
  color: string
  label: string
  description: string
}

const ARC_LENGTH = 213.6

function getTier(score: number): TierInfo {
  if (score >= 75) return { color: "#EF4444", label: "High Risk", description: "High RTS probability" }
  if (score >= 50) return { color: "#F97316", label: "Medium Risk", description: "Moderate RTS probability" }
  if (score >= 25) return { color: "#EAB308", label: "Low Risk", description: "Low RTS probability" }
  return { color: "#22C55E", label: "Trusted", description: "Reliable buyer history" }
}

function arcPath(cx: number, cy: number, r: number, pct: number): string {
  const clamped = Math.max(0, Math.min(0.9999, pct))
  if (clamped <= 0) return ""
  const endDeg = -90 + clamped * 360
  const rad = (endDeg * Math.PI) / 180
  const x = cx + r * Math.cos(rad)
  const y = cy + r * Math.sin(rad)
  const large = clamped > 0.5 ? 1 : 0
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}`
}

const RiskScore = memo(function RiskScore({ score, size }: RiskScoreProps) {
  const tier = getTier(score)
  const pct = score / 100
  const arcTarget = ARC_LENGTH * (1 - pct)

  if (size === "table") {
    return (
      <div
        className="flex items-center justify-center rounded-full w-8 h-8 shrink-0"
        style={{ border: `2.5px solid ${tier.color}`, backgroundColor: `${tier.color}26` }}
      >
        <span className="text-[11px] font-bold leading-none" style={{ color: tier.color }}>
          {score}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
        <circle cx="40" cy="40" r="34" fill="#0B0D12" stroke="#2A303C" strokeWidth="6" />
        {pct > 0 && (
          <path
            d={arcPath(40, 40, 34, 1)}
            fill="none"
            stroke={tier.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            style={{
              "--arc-length": `${ARC_LENGTH}px`,
              "--arc-target": `${arcTarget}px`,
              strokeDashoffset: ARC_LENGTH,
              animation: "riskArc 800ms ease-out forwards",
            } as React.CSSProperties}
          />
        )}
        <text
          x="40"
          y="36"
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          {score}
        </text>
        <text
          x="40"
          y="52"
          textAnchor="middle"
          fill="#6B7280"
          fontSize="10"
          fontFamily="Inter, sans-serif"
        >
          /100
        </text>
      </svg>

      <div className="text-center">
        <p className="text-[12px] font-bold" style={{ color: tier.color }}>
          {tier.label}
        </p>
        <p className="text-[10px]" style={{ color: "#6B7280" }}>
          {tier.description}
        </p>
      </div>
    </div>
  )
})

export default RiskScore

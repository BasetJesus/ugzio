"use client"

import { useState, useEffect, useRef } from "react"

interface Props {
  protectedAmount: number
  estimatedLossPrevented?: number
  todayLabel?: string
  compact?: boolean
  emotion?: "calm" | "protected" | "stable"
  continuityLabel?: string
}

const EMOTION_CONFIG = {
  calm: { border: "var(--state-calm-bg)", bg: "var(--state-calm-bg)", glow: "var(--glow-calm)", color: "var(--state-calm)" },
  protected: { border: "var(--success-green-border)", bg: "var(--emotion-protection)", glow: "var(--emotion-celebration-glow)", color: "var(--state-protected)" },
  stable: { border: "var(--border)", bg: "var(--bg-surface)", glow: "var(--glow-soft)", color: "var(--text-tertiary)" },
}

export default function RevenueShield({ protectedAmount, estimatedLossPrevented = 0, todayLabel = "Protected Today", compact = false, emotion = "protected", continuityLabel }: Props) {
  const [animate, setAnimate] = useState(false)
  const prevAmount = useRef(protectedAmount)
  const [displayAmount, setDisplayAmount] = useState(protectedAmount)

  useEffect(() => {
    if (prevAmount.current !== protectedAmount && protectedAmount > 0) {
      setAnimate(true)
      const t1 = setTimeout(() => {
        setDisplayAmount(protectedAmount)
        prevAmount.current = protectedAmount
      }, 50)
      const t2 = setTimeout(() => setAnimate(false), 600)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else {
      setDisplayAmount(protectedAmount)
      prevAmount.current = protectedAmount
    }
  }, [protectedAmount])

  const emotionCfg = EMOTION_CONFIG[emotion]

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300" style={{ backgroundColor: emotionCfg.bg, border: `1px solid ${emotionCfg.border}` }}>
        <span className={"text-sm " + (animate ? "animate-revenue-increment" : "")}>\uD83D\uDEE1\uFE0F</span>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: emotionCfg.color }}>{todayLabel}</p>
          <p className={"text-sm font-bold " + (animate ? "animate-revenue-increment" : "")} style={{ color: emotionCfg.color }}>
            {displayAmount.toFixed(0)} TND
          </p>
        </div>
      </div>
    )
  }

  const hasImpact = protectedAmount > 0 || estimatedLossPrevented > 0
  const totalImpact = protectedAmount + estimatedLossPrevented

  return (
    <div
      className="rounded-xl border p-panel relative overflow-hidden transition-all duration-500"
      style={{
        borderColor: emotionCfg.border,
        backgroundColor: emotionCfg.bg,
        boxShadow: animate ? emotionCfg.glow : "none",
      }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-caption" style={{ color: emotionCfg.color }}>{todayLabel}</p>
          <p className={"text-emotion mt-1 " + (animate ? "animate-revenue-increment" : "")} style={{ color: emotionCfg.color }}>
            {displayAmount.toFixed(0)} TND
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Revenue protected through operator decisions
          </p>
          {continuityLabel && (
            <p className="text-[10px] text-[var(--state-calm)] mt-0.5">
              {continuityLabel}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border" style={{ backgroundColor: emotionCfg.bg, borderColor: emotionCfg.border }}>
          <span className={"text-lg " + (animate ? "animate-revenue-increment" : "")}>\uD83D\uDEE1\uFE0F</span>
        </div>
      </div>

      {hasImpact && (
        <div className="mt-4 space-y-2">
          <div className="h-1.5 rounded-full bg-[var(--bg-card)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: Math.min((totalImpact / 200) * 100, 100) + "%",
                backgroundColor: emotionCfg.color,
                opacity: 0.5,
              }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-medium" style={{ color: emotionCfg.color }}>
              {displayAmount.toFixed(0)} TND saved
            </span>
            {estimatedLossPrevented > 0 && (
              <>
                <span className="text-[var(--text-tertiary)]">\u2022</span>
                <span className="text-[var(--text-tertiary)]">
                  {estimatedLossPrevented.toFixed(0)} TND losses prevented
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

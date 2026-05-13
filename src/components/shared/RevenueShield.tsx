"use client"

import { useState, useEffect, useRef } from "react"

interface Props {
  protectedAmount: number
  todayLabel?: string
  compact?: boolean
}

export default function RevenueShield({ protectedAmount, todayLabel = "Protected Today", compact = false }: Props) {
  const [animate, setAnimate] = useState(false)
  const prevAmount = useRef(protectedAmount)
  const [displayAmount, setDisplayAmount] = useState(protectedAmount)

  useEffect(() => {
    if (prevAmount.current !== protectedAmount && protectedAmount > 0) {
      setAnimate(true)
      const timer = setTimeout(() => {
        setDisplayAmount(protectedAmount)
        prevAmount.current = protectedAmount
      }, 50)
      const resetTimer = setTimeout(() => setAnimate(false), 600)
      return () => {
        clearTimeout(timer)
        clearTimeout(resetTimer)
      }
    } else {
      setDisplayAmount(protectedAmount)
      prevAmount.current = protectedAmount
    }
  }, [protectedAmount])

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-[var(--emotion-protection)] border border-[var(--success-green-border)] px-3 py-2">
        <span className={`text-sm ${animate ? "animate-revenue-increment" : ""}`}>
          \uD83D\uDEE1\uFE0F
        </span>
        <div>
          <p className="text-[10px] text-[var(--success-green)] font-medium uppercase tracking-wider">{todayLabel}</p>
          <p className={`text-sm font-bold text-[var(--success-green)] ${animate ? "animate-revenue-increment" : ""}`}>
            {displayAmount.toFixed(0)} TND
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border p-panel relative overflow-hidden"
      style={{
        borderColor: "var(--success-green-border)",
        backgroundColor: "var(--emotion-protection)",
        boxShadow: animate ? "var(--emotion-celebration-glow)" : "none",
      }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-caption text-[var(--success-green)]">{todayLabel}</p>
          <p className={`text-emotion text-[var(--success-green)] mt-1 ${animate ? "animate-revenue-increment" : ""}`}>
            {displayAmount.toFixed(0)} TND
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Revenue protected through operator decisions
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success-green-bg)] border border-[var(--success-green-border)]">
          <span className={`text-lg ${animate ? "animate-revenue-increment" : ""}`}>\uD83D\uDEE1\uFE0F</span>
        </div>
      </div>

      {protectedAmount > 0 && (
        <div className="mt-4 h-1 rounded-full bg-[var(--bg-card)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--success-green)] transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(protectedAmount / 100, 100)}%`,
              opacity: 0.6,
            }}
          />
        </div>
      )}
    </div>
  )
}

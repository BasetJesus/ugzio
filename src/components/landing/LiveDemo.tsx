"use client"

import { useState, useEffect, useCallback } from "react"

type DemoPhase = "order-arrives" | "risk-analyzed" | "psychology-selected" | "action-taken"

interface DemoScenario {
  buyerName: string
  amount: number
  trustScore: number
  riskLevel: string
  sequenceType: string
  sequenceReason: string
  revenueOutcome: string
}

const SCENARIOS: Record<string, DemoScenario> = {
  first_time: {
    buyerName: "Mariem L.",
    amount: 180,
    trustScore: 22,
    riskLevel: "high",
    sequenceType: "Reassurance",
    sequenceReason: "First-time buyer — reducing anxiety with trust signals before shipping",
    revenueOutcome: "+180 TND secured by building buyer confidence",
  },
  high_value: {
    buyerName: "Amine K.",
    amount: 450,
    trustScore: 35,
    riskLevel: "high",
    sequenceType: "Urgency",
    sequenceReason: "High value at risk — framing as reservation to prompt quick confirmation",
    revenueOutcome: "+450 TND secured through urgency framing",
  },
  returning: {
    buyerName: "Fatma T.",
    amount: 95,
    trustScore: 78,
    riskLevel: "low",
    sequenceType: "Trust",
    sequenceReason: "Returning buyer — maintaining confidence with calm reassurance",
    revenueOutcome: "+95 TND secured — standard trust flow",
  },
  hesitant: {
    buyerName: "Youssef H.",
    amount: 210,
    trustScore: 45,
    riskLevel: "medium",
    sequenceType: "Reminder",
    sequenceReason: "No response yet — operational nudge to confirm reachability",
    revenueOutcome: "+210 TND secured through gentle reminder",
  },
}

const PHASE_LABELS: Record<DemoPhase, string> = {
  "order-arrives": "Order arrives",
  "risk-analyzed": "Risk analyzed",
  "psychology-selected": "Psychology selected",
  "action-taken": "Revenue outcome",
}

export default function InteractiveDemo() {
  const [scenario, setScenario] = useState("first_time")
  const [phase, setPhase] = useState<DemoPhase>("order-arrives")
  const [autoPlay, setAutoPlay] = useState(true)
  const [revenueAnimate, setRevenueAnimate] = useState(false)

  const data = SCENARIOS[scenario]

  const advancePhase = useCallback(() => {
    setPhase((p) => {
      if (p === "order-arrives") return "risk-analyzed"
      if (p === "risk-analyzed") return "psychology-selected"
      if (p === "psychology-selected") return "action-taken"
      return "action-taken"
    })
  }, [])

  useEffect(() => {
    if (!autoPlay) return
    setPhase("order-arrives")
    const t1 = setTimeout(() => setPhase("risk-analyzed"), 1200)
    const t2 = setTimeout(() => setPhase("psychology-selected"), 2400)
    const t3 = setTimeout(() => setPhase("action-taken"), 3600)
    const t4 = setTimeout(() => setRevenueAnimate(true), 3800)
    const reset = setTimeout(() => {
      setRevenueAnimate(false)
      setPhase("order-arrives")
    }, 6000)
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(reset)
    }
  }, [scenario, autoPlay])

  function handleScenario(key: string) {
    setAutoPlay(true)
    setRevenueAnimate(false)
    setScenario(key)
    setPhase("order-arrives")
  }

  const riskColor = data.riskLevel === "high" ? "var(--risk-red)" : data.riskLevel === "medium" ? "var(--warning-amber)" : "var(--success-green)"

  return (
    <section className="section-gradient-divider pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Experience UGZIO in{" "}
            <span className="gradient-live">real time</span>
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Choose a buyer type. Watch UGZIO analyze, decide, and protect revenue.
          </p>
        </div>

        {/* Scenario selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {Object.entries(SCENARIOS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => handleScenario(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                scenario === key
                  ? "glass-strong text-[var(--text-primary)]"
                  : "glass text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {val.buyerName} — {val.amount} TND
            </button>
          ))}
        </div>

        {/* Demo simulation */}
        <div className="max-w-lg mx-auto">
          <div className="glass-strong rounded-xl p-6 relative overflow-hidden">
            {/* Phase indicator */}
            <div className="flex items-center justify-between mb-6 text-[10px] text-[var(--text-tertiary)]">
              {(Object.keys(PHASE_LABELS) as DemoPhase[]).map((p, i) => {
                const order = Object.keys(PHASE_LABELS) as DemoPhase[]
                const idx = order.indexOf(phase)
                const done = i <= idx
                return (
                  <div key={p} className="flex flex-col items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full transition-all duration-500 ${
                        done ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                      }`}
                    />
                    <span className={done ? "text-[var(--text-secondary)]" : ""}>{PHASE_LABELS[p]}</span>
                  </div>
                )
              })}
            </div>

            {/* Active phase content */}
            <div className="min-h-[200px] transition-all duration-500">
              {phase === "order-arrives" && (
                <div className="animate-shimmer-in space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-sm">
                      \uD83D\uDCE5
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">New order received</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Incoming from checkout</p>
                    </div>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-base font-semibold text-[var(--text-primary)]">{data.buyerName}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{data.amount.toFixed(0)} TND</p>
                  </div>
                </div>
              )}

              {phase === "risk-analyzed" && (
                <div className="animate-shimmer-in space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: riskColor + "20" }}>
                      \uD83D\uDCCA
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">Risk analysis complete</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Behavioral signals evaluated</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="glass rounded-lg p-3">
                      <p className="text-[10px] text-[var(--text-tertiary)]">Trust Score</p>
                      <p className="text-base font-bold text-[var(--text-primary)]">{data.trustScore}</p>
                    </div>
                    <div className="glass rounded-lg p-3">
                      <p className="text-[10px] text-[var(--text-tertiary)]">Risk Level</p>
                      <p className="text-base font-bold" style={{ color: riskColor }}>{data.riskLevel.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              )}

              {phase === "psychology-selected" && (
                <div className="animate-shimmer-in space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-[var(--psych-reminder-bg)] flex items-center justify-center text-sm">
                      \uD83E\uDDE0
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">Psychology sequence selected</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Behavioral intelligence applied</p>
                    </div>
                  </div>
                  <div className="glass rounded-lg p-4 border border-[var(--psych-trust)]/20">
                    <p className="text-sm font-semibold text-[var(--accent)]">{data.sequenceType}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{data.sequenceReason}</p>
                  </div>
                </div>
              )}

              {phase === "action-taken" && (
                <div className="animate-shimmer-in space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-[var(--emotion-protection)] flex items-center justify-center text-sm">
                      \uD83D\uDEE1\uFE0F
                    </span>
                    <div>
                      <p className={`text-sm font-medium text-[var(--success-green)] ${revenueAnimate ? "animate-revenue-increment" : ""}`}>
                        Revenue protected
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">Operator decision + psychology sequence</p>
                    </div>
                  </div>
                  <div className="glass rounded-lg p-4 bg-[var(--emotion-protection)] border border-[var(--success-green-border)]">
                    <p className="text-lg font-bold text-[var(--success-green)]">{data.amount.toFixed(0)} TND</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{data.revenueOutcome}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-[var(--text-tertiary)] mt-4">
            Each scenario runs automatically. Change buyer type to see different psychology sequences.
          </p>
        </div>
      </div>
    </section>
  )
}

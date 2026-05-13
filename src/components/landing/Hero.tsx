"use client"

import { useState, useEffect, useRef } from "react"

function AnimatedRevenue({ target }: { target: number }) {
  const [val, setVal] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const from = 0
    const dur = 2500
    function tick(now: number) {
      const t = Math.min((now - start) / dur, 1)
      setVal(Math.round(from + (target - from) * t))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target])

  return <span>{val.toLocaleString()}</span>
}

function JitterMetric({ base, suffix = "" }: { base: number; suffix?: string }) {
  const [val, setVal] = useState(base)
  useEffect(() => {
    const iv = setInterval(() => {
      setVal((p) => Math.max(10, p + Math.floor(Math.random() * 12 - 6)))
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(iv)
  }, [])
  return <span>{val}{suffix}</span>
}

const DEMO_ORDERS = [
  { name: "Ahmed B.", amount: 240, risk: 89, psych: "urgency" as const },
  { name: "Sarra M.", amount: 180, risk: 62, psych: "reminder" as const },
  { name: "Karim J.", amount: 320, risk: 78, psych: "reassurance" as const },
]

const PSYCH_STYLES: Record<string, string> = {
  urgency: "border-[var(--psych-urgency)]/30 bg-[var(--psych-urgency-bg)] text-[var(--psych-urgency)]",
  reminder: "border-[var(--psych-reminder)]/30 bg-[var(--psych-reminder-bg)] text-[var(--psych-reminder)]",
  reassurance: "border-[var(--psych-reassurance)]/30 bg-[var(--psych-reassurance-bg)] text-[var(--psych-reassurance)]",
  trust: "border-[var(--psych-trust)]/30 bg-[var(--psych-trust-bg)] text-[var(--psych-trust)]",
}

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [psychLabel, setPsychLabel] = useState("Psych Sequence")
  const [psychDetail, setPsychDetail] = useState("")

  useEffect(() => {
    const cycle = setInterval(() => {
      setActiveIdx((p) => (p + 1) % DEMO_ORDERS.length)
    }, 3200)
    return () => clearInterval(cycle)
  }, [])

  useEffect(() => {
    const order = DEMO_ORDERS[activeIdx]
    const labels: Record<string, { label: string; detail: string }> = {
      urgency: { label: "Urgency Sequence", detail: "Framing as reserved to prompt immediate confirmation" },
      reminder: { label: "Reminder Sequence", detail: "Operational nudge — buyer hasn't responded" },
      reassurance: { label: "Reassurance Sequence", detail: "Building confidence for first-time buyer" },
      trust: { label: "Trust Sequence", detail: "Maintaining calm — buyer has good history" },
    }
    const info = labels[order.psych]
    setPsychLabel(info.label)
    setPsychDetail(info.detail)
  }, [activeIdx])

  const active = DEMO_ORDERS[activeIdx]

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-accent-bg opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[var(--accent)]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Emotional Headline */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-green)] animate-pulse-soft" />
              <span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-wide">
                Behavioral commerce intelligence
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
              UGZIO predicts delivery failure{" "}
              <span className="gradient-behavioral">before it costs you money.</span>
            </h1>

            <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg max-w-lg">
              Behavioral intelligence for modern DTC operations. UGZIO analyzes buyer psychology, 
              predicts COD failure risk, and guides every confirmation decision — in real time.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/overview?demo=true"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Experience Live Simulation
              </a>
              <a
                href="#problems"
                className="inline-flex items-center justify-center rounded-lg glass-strong px-6 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1.5">
                <span className="text-[var(--success-green)]">\u2713</span> No setup
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[var(--success-green)]">\u2713</span> Real-time risk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[var(--success-green)]">\u2713</span> Psychology-driven
              </span>
            </div>
          </div>

          {/* Right — Floating Operational Mockup */}
          <div className="relative lg:justify-self-end">
            <div className="absolute inset-0 bg-[var(--accent)]/5 rounded-3xl blur-[60px] pointer-events-none" />

            <div className="relative space-y-3 w-full max-w-[420px]">
              {/* Top row — KPI cards */}
              <div className="flex gap-3">
                <div className="flex-1 glass-card rounded-xl p-4 animate-float" style={{ animationDelay: "0s" }}>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">At Risk</p>
                  <p className="text-xl font-bold text-[var(--risk-red)] mt-0.5">
                    <JitterMetric base={347} suffix=" TND" />
                  </p>
                </div>
                <div className="flex-1 glass-card rounded-xl p-4 animate-float-delayed" style={{ animationDelay: "0.5s" }}>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Protected</p>
                  <p className="text-xl font-bold text-[var(--success-green)] mt-0.5">
                    <AnimatedRevenue target={1280} /> TND
                  </p>
                </div>
              </div>

              {/* Middle — Main operational card */}
              <div className="glass-strong rounded-xl p-4 animate-hero-card-enter relative hero-glow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-green)] animate-pulse-soft" />
                    <span className="text-[11px] font-medium text-[var(--text-secondary)]">Live Queue</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)]">12 orders today</span>
                </div>

                <div className="space-y-2">
                  {DEMO_ORDERS.map((order, i) => {
                    const isActive = i === activeIdx
                    return (
                      <div
                        key={order.name}
                        className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 transition-all duration-500 ${
                          isActive
                            ? "glass-strong border border-[var(--accent)]/20"
                            : "border border-transparent opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              isActive ? "bg-[var(--risk-red)] animate-pulse" : order.risk > 70 ? "bg-[var(--risk-red)]" : "bg-[var(--warning-amber)]"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-sm text-[var(--text-primary)] truncate">{order.name}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)]">{order.amount} TND</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-semibold ${order.risk > 70 ? "text-[var(--risk-red)]" : "text-[var(--warning-amber)]"}`}>
                            {order.risk}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Psychology suggestion */}
                <div className={`mt-3 rounded-lg border px-3.5 py-2.5 transition-all duration-500 ${PSYCH_STYLES[active.psych]}`}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider">{psychLabel}</p>
                  <p className="text-[11px] mt-0.5 opacity-80">{psychDetail}</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 rounded-lg bg-[var(--btn-green)]/90 px-3 py-2 text-xs font-medium text-white hover:bg-[var(--btn-green-hover)] transition-colors">
                    Secure Revenue
                  </button>
                  <button className="flex-1 rounded-lg border border-[var(--risk-red)]/30 px-3 py-2 text-xs font-medium text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] transition-colors">
                    Prevent Loss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

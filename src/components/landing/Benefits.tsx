"use client"

import { useState, useEffect, useRef } from "react"

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const dur = 2000
    function tick(now: number) {
      const t = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(target * eased))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target])

  return <span>{val.toLocaleString()}{suffix}</span>
}

export default function TrustMetrics() {
  return (
    <section className="section-gradient-divider py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-wide">
              Measurable outcomes
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl lg:text-4xl max-w-2xl mx-auto">
            Revenue protection you can{" "}
            <span className="gradient-protection">see and measure</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-[var(--success-green)]">
              <CountUp target={23} />%
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Failed deliveries prevented</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-[var(--success-green)]">
              <CountUp target={4850} suffix=" TND" />
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Revenue protected monthly</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-[var(--warning-amber)]">
              <CountUp target={89} suffix="%" />
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Confirmation confidence</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-[var(--accent)]">
              <CountUp target={3} />s
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Per decision time</p>
          </div>
        </div>

        <div className="mt-10 max-w-xl mx-auto glass-card rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">\uD83D\uDEE1\uFE0F</span>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Every operator action saves money. UGZIO measures it.
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                When you confirm, UGZIO calculates revenue saved. When you cancel, it calculates loss prevented. 
                The system learns, improves, and protects more over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

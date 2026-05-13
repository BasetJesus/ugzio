"use client"

import { useState } from "react"

const PAIN_POINTS = [
  {
    icon: "\uD83D\uDCF1",
    title: "Buyers ignore calls",
    description: "You call to confirm. No answer. You ship anyway. Package returns.",
    cost: "Cost: 15-25 TND per RTS",
    emotion: "tense" as const,
  },
  {
    icon: "\uD83D\uDCE6",
    title: "Fake COD orders",
    description: "Someone orders 300 TND of product. Never picks up. You pay return shipping.",
    cost: "Cost: full RTS + lost product margin",
    emotion: "tense" as const,
  },
  {
    icon: "\uD83D\uDEAB",
    title: "Unreachable buyers",
    description: "Wrong number. Temporary number. Buyer changed their mind. No way to know.",
    cost: "Cost: 20-40 TND per failed delivery",
    emotion: "tense" as const,
  },
  {
    icon: "\uD83D\uDCA8",
    title: "Ad spend wasted",
    description: "You paid for the click. You paid for the product. You paid for failed shipping. Three losses.",
    cost: "Cost: 3x loss per failed customer",
    emotion: "tense" as const,
  },
  {
    icon: "\uD83D\uDE4B",
    title: "Operators overwhelmed",
    description: "50 orders to confirm. 10 are risky. Which ones? You guess. You lose money.",
    cost: "Cost: missed revenue + operator burnout",
    emotion: "tense" as const,
  },
  {
    icon: "\u26A0\uFE0F",
    title: "No intelligence layer",
    description: "No system tells you who will actually pay. Every order is a gamble until delivery.",
    cost: "Cost: unpredictable losses every week",
    emotion: "tense" as const,
  },
]

export default function Problems() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="problems" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-wide">
              The real cost of COD commerce
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl lg:text-4xl max-w-2xl mx-auto">
            UGZIO understands your delivery problems because{" "}
            <span className="gradient-behavioral">we built it for this market.</span>
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            Every pain point below costs Tunisian DTC sellers real money. UGZIO stops each one.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {PAIN_POINTS.map((point, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-5 transition-all duration-300 cursor-default"
              style={{
                transform: hovered === i ? "translateY(-2px)" : "none",
                borderColor: hovered === i ? "var(--kpi-red-border)" : undefined,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{point.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{point.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{point.description}</p>
                  <p className="text-[10px] font-medium text-[var(--risk-red)] mt-2">{point.cost}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5">
            <span className="text-sm text-[var(--text-secondary)]">
              UGZIO solves all of these with{" "}
              <strong className="text-[var(--accent)]">behavioral intelligence</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

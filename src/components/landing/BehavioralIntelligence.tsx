"use client"

import { useState } from "react"

const SEQUENCES = [
  {
    type: "Trust",
    icon: "\u2714\uFE0F",
    color: "var(--psych-trust)",
    bg: "var(--psych-trust-bg)",
    border: "var(--psych-trust)",
    when: "Returning buyers with good history",
    why: "Maintain confidence — prevent last-minute hesitation",
    message: "Salam {name}, your order of {amount} TND is confirmed. We'll deliver within 3 days.",
  },
  {
    type: "Reminder",
    icon: "\uD83D\uDD14",
    color: "var(--psych-reminder)",
    bg: "var(--psych-reminder-bg)",
    border: "var(--psych-reminder)",
    when: "Medium risk + no prior response",
    why: "Operational nudge — ensure buyer is reachable",
    message: "Hi {name}, just checking in on your order of {amount} TND. Are you available for delivery?",
  },
  {
    type: "Urgency",
    icon: "\u26A0\uFE0F",
    color: "var(--psych-urgency)",
    bg: "var(--psych-urgency-bg)",
    border: "var(--psych-urgency)",
    when: "High value at risk — 150+ TND orders",
    why: "Reservation framing — prompt quick confirmation before shipping window closes",
    message: "Hello {name}, your {amount} TND order is reserved. Please confirm within 2 hours.",
  },
  {
    type: "Reassurance",
    icon: "\uD83D\uDE4C",
    color: "var(--psych-reassurance)",
    bg: "var(--psych-reassurance-bg)",
    border: "var(--psych-reassurance)",
    when: "First-time buyers or low trust score",
    why: "Reduce anxiety — build confidence with clear delivery signals",
    message: "Salam {name}, your order of {amount} TND is being prepared. We deliver within 3 days.",
  },
]

export default function BehavioralIntelligence() {
  const [active, setActive] = useState(0)

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-wide">
              Not AI hype — behavioral science
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl lg:text-4xl max-w-2xl mx-auto">
            Every buyer gets a{" "}
            <span className="gradient-behavioral">psychology-driven sequence</span>
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            UGZIO doesn&apos;t just score risk. It selects the right psychological approach for each buyer.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5 max-w-5xl mx-auto items-start">
          {/* Sequence selector */}
          <div className="lg:col-span-2 space-y-2">
            {SEQUENCES.map((seq, i) => (
              <button
                key={seq.type}
                onClick={() => setActive(i)}
                className={`w-full text-left rounded-xl p-4 transition-all duration-300 ${
                  active === i
                    ? "glass-strong"
                    : "glass hover:glass-strong"
                }`}
                style={{
                  borderColor: active === i ? seq.border + "40" : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: seq.bg }}
                  >
                    {seq.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{seq.type}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{seq.when}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Active sequence detail */}
          <div className="lg:col-span-3">
            <div
              className="glass-strong rounded-xl p-6 animate-psychology-reveal"
              key={active}
              style={{
                borderColor: SEQUENCES[active].border + "30",
              }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 mb-4"
                style={{ backgroundColor: SEQUENCES[active].bg }}
              >
                <span className="text-sm">{SEQUENCES[active].icon}</span>
                <span className="text-xs font-semibold" style={{ color: SEQUENCES[active].color }}>
                  {SEQUENCES[active].type} Sequence
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">When it&apos;s used</p>
                  <p className="text-sm text-[var(--text-primary)] mt-1">{SEQUENCES[active].when}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Psychological goal</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{SEQUENCES[active].why}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">WhatsApp preview</p>
                  <div
                    className="mt-2 rounded-lg p-4 border"
                    style={{
                      backgroundColor: "var(--bg-base)",
                      borderColor: SEQUENCES[active].border + "20",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-5 rounded-full bg-[var(--success-green)]/20 flex items-center justify-center text-[8px]">
                        \uD83D\uDCF1
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)]">WhatsApp outbound</span>
                    </div>
                    <p className="text-sm italic text-[var(--text-secondary)] leading-relaxed">
                      {SEQUENCES[active].message}
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-lg px-4 py-3 text-xs leading-relaxed"
                  style={{ backgroundColor: SEQUENCES[active].bg + "40" }}
                >
                  <span className="font-medium" style={{ color: SEQUENCES[active].color }}>
                    Why this works:
                  </span>{" "}
                  <span className="text-[var(--text-secondary)]">
                    Every sequence is based on behavioral psychology research for COD commerce, 
                    not generic marketing templates. The system learns which sequences perform best per buyer profile.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

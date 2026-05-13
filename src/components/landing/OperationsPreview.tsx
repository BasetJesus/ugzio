"use client"

const CARDS = [
  {
    handle: "@boutique_sidi",
    action: "Secure Revenue",
    amount: "180 TND",
    sequence: "Reassurance",
    time: "2m ago",
  },
  {
    handle: "@tunisian_style",
    action: "Prevent Loss",
    amount: "320 TND",
    sequence: "Urgency",
    time: "5m ago",
  },
  {
    handle: "@sousse_shop",
    action: "Secure Revenue",
    amount: "95 TND",
    sequence: "Trust",
    time: "12m ago",
  },
  {
    handle: "@nabeul_store",
    action: "Re-contact",
    amount: "210 TND",
    sequence: "Reminder",
    time: "18m ago",
  },
]

export default function SocialEnergy() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-wide">
              Modern operators, modern tools
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl lg:text-4xl max-w-2xl mx-auto">
            DTC sellers protect revenue{" "}
            <span className="gradient-live">in real time</span>
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            Every confirmation is a revenue protection moment. Every decision creates an outcome.
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-3">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-4 transition-all duration-500 hover:glass-strong"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)]">
                    {card.handle[1].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--text-primary)]">{card.handle}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{card.time}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    card.action === "Secure Revenue"
                      ? "bg-[var(--emotion-protection)] text-[var(--success-green)]"
                      : card.action === "Prevent Loss"
                      ? "bg-[var(--emotion-tension)] text-[var(--risk-red)]"
                      : "bg-[var(--emotion-achievement)] text-[var(--warning-amber)]"
                  }`}
                >
                  {card.action}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-base font-bold text-[var(--text-primary)]">{card.amount}</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  Psychology:{" "}
                  <span className="font-medium text-[var(--accent)]">{card.sequence}</span>
                </span>
              </div>

              <div className="mt-2 flex gap-1.5">
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                    card.sequence === "Reassurance"
                      ? "border-[var(--psych-reassurance)]/30 bg-[var(--psych-reassurance-bg)] text-[var(--psych-reassurance)]"
                      : card.sequence === "Urgency"
                      ? "border-[var(--psych-urgency)]/30 bg-[var(--psych-urgency-bg)] text-[var(--psych-urgency)]"
                      : card.sequence === "Reminder"
                      ? "border-[var(--psych-reminder)]/30 bg-[var(--psych-reminder-bg)] text-[var(--psych-reminder)]"
                      : "border-[var(--psych-trust)]/30 bg-[var(--psych-trust-bg)] text-[var(--psych-trust)]"
                  }`}
                >
                  {card.sequence}
                </span>
                <span className="text-[9px] text-[var(--text-tertiary)]">WhatsApp sequence active</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[var(--text-tertiary)] mt-8">
          Real operators protecting real revenue. UGZIO makes every decision intelligent.
        </p>
      </div>
    </section>
  )
}

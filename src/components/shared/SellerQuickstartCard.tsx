"use client"

import type { QuickstartProgress } from "@/services/pilot.service"

interface Props {
  data: QuickstartProgress
}

const STEPS = [
  { key: "whatsappConnected" as const, label: "Connect WhatsApp", icon: "📱" },
  { key: "ordersImported" as const, label: "Import orders", icon: "📦" },
  { key: "firstConfirmationDone" as const, label: "First confirmation", icon: "✅" },
  { key: "firstDeliveryProtected" as const, label: "First delivery protected", icon: "🛡️" },
  { key: "firstUgcSent" as const, label: "First UGC request", icon: "📷" },
]

export default function SellerQuickstartCard({ data }: Props) {
  const allDone = data.completedSteps >= data.totalSteps
  const pct = Math.round((data.completedSteps / data.totalSteps) * 100)

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-[var(--accent)]">Quickstart</p>
            <h2 className="text-display text-[var(--text-primary)] mt-1">
              {allDone ? "You're operational!" : "Set up your store"}
            </h2>
          </div>
          <span className="text-2xl">{allDone ? "🎉" : "🚀"}</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {allDone ? "All steps completed. UGZIO is protecting your revenue." : data.nextAction}
        </p>
      </div>

      <div className="px-panel pt-3 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
              style={{ width: pct + "%" }}
            />
          </div>
          <span className="text-[10px] font-medium text-[var(--text-secondary)]">
            {data.completedSteps}/{data.totalSteps}
          </span>
        </div>

        <div className="space-y-1.5">
          {STEPS.map((step) => {
            const done = data[step.key]
            return (
              <div key={step.key} className="flex items-center gap-2 py-1">
                <div
                  className={"h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0 " + (done ? "bg-[var(--success-green-bg)]" : "bg-[var(--border)]")}
                >
                  {done ? "✓" : step.icon}
                </div>
                <span className={"text-xs " + (done ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-tertiary)]")}>
                  {step.label}
                </span>
                {done && <span className="text-[9px] text-[var(--success-green)] ml-auto shrink-0">Done</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

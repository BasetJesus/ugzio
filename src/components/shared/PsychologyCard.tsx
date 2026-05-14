import type { SequenceType } from "@/types/whatsapp"

interface Props {
  sequenceType: SequenceType
  psychologicalReason: string
  expectedGoal: string
  previewMessage: string
  messageCount?: number
  className?: string
}

const PSYCH_STYLES: Record<SequenceType, {
  label: string
  accent: string
  bg: string
  border: string
  icon: string
}> = {
  trust: {
    label: "Trust",
    accent: "var(--psych-trust)",
    bg: "var(--psych-trust-bg)",
    border: "var(--psych-trust)",
    icon: "✔️",
  },
  reminder: {
    label: "Reminder",
    accent: "var(--psych-reminder)",
    bg: "var(--psych-reminder-bg)",
    border: "var(--psych-reminder)",
    icon: "🔔",
  },
  urgency: {
    label: "Urgency",
    accent: "var(--psych-urgency)",
    bg: "var(--psych-urgency-bg)",
    border: "var(--psych-urgency)",
    icon: "⚠️",
  },
  reassurance: {
    label: "Reassurance",
    accent: "var(--psych-reassurance)",
    bg: "var(--psych-reassurance-bg)",
    border: "var(--psych-reassurance)",
    icon: "🙌",
  },
}

export default function PsychologyCard({ sequenceType, psychologicalReason, expectedGoal, previewMessage, messageCount, className = "" }: Props) {
  const style = PSYCH_STYLES[sequenceType]

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 animate-psychology-reveal ${className}`}
      style={{
        borderColor: style.border + "30",
        backgroundColor: style.bg,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{style.icon}</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: style.accent }}>{style.label} Sequence</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {messageCount ? `${messageCount} messages` : "Psychology-driven"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{psychologicalReason}</p>
        <div className="flex items-start gap-1.5">
          <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">→</span>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{expectedGoal}</p>
        </div>
      </div>

      {previewMessage && (
        <div
          className="rounded-lg p-3 text-xs leading-relaxed border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: style.border + "20",
            color: "var(--text-secondary)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: style.accent }}>
              Preview
            </span>
            <span className="text-[9px] text-[var(--text-tertiary)]">· WhatsApp</span>
          </div>
          <p className="italic opacity-90">{previewMessage}</p>
        </div>
      )}
    </div>
  )
}

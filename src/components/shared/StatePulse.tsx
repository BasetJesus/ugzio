"use client"

interface Props {
  state: "calm" | "focused" | "urgent" | "celebration"
  label?: string
  size?: "sm" | "md"
}

const STATE_CONFIG = {
  calm: {
    color: "var(--success-green)",
    bg: "var(--success-green-bg)",
    animation: "",
    label: "Stable",
  },
  focused: {
    color: "var(--accent)",
    bg: "var(--emotion-calm)",
    animation: "animate-pulse-soft",
    label: "Active",
  },
  urgent: {
    color: "var(--risk-red)",
    bg: "var(--emotion-tension)",
    animation: "animate-pulse",
    label: "Attention needed",
  },
  celebration: {
    color: "var(--warning-amber)",
    bg: "var(--emotion-achievement)",
    animation: "animate-pulse-soft",
    label: "Revenue protected",
  },
}

export default function StatePulse({ state, label, size = "sm" }: Props) {
  const cfg = STATE_CONFIG[state]
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[var(--nav-border)] px-2.5 py-0.5">
      <span
        className={`${dotSize} rounded-full ${cfg.animation}`}
        style={{ backgroundColor: cfg.color }}
      />
      <span className="text-[10px] font-medium text-[var(--text-secondary)]">
        {label ?? cfg.label}
      </span>
    </div>
  )
}

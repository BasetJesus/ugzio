"use client"

interface Props {
  state: "calm" | "focused" | "urgent" | "protected" | "recovering" | "stable" | "celebration"
  label?: string
  size?: "sm" | "md"
}

const STATE_CONFIG = {
  calm: {
    color: "var(--state-calm)",
    bg: "var(--state-calm-bg)",
    animation: "animate-pulse-calm",
    label: "Stable",
    dotSize: "h-1.5 w-1.5",
  },
  focused: {
    color: "var(--state-focused)",
    bg: "var(--state-focused-bg)",
    animation: "animate-pulse-focused",
    label: "Actif",
    dotSize: "h-1.5 w-1.5",
  },
  urgent: {
    color: "var(--state-urgent)",
    bg: "var(--state-urgent-bg)",
    animation: "animate-pulse-urgent",
    label: "Attention requise",
    dotSize: "h-2 w-2",
  },
  protected: {
    color: "var(--state-protected)",
    bg: "var(--state-protected-bg)",
    animation: "animate-pulse-protected",
    label: "Protégé",
    dotSize: "h-1.5 w-1.5",
  },
  recovering: {
    color: "var(--state-recovering)",
    bg: "var(--state-recovering-bg)",
    animation: "animate-pulse-focused",
    label: "Récupération",
    dotSize: "h-1.5 w-1.5",
  },
  stable: {
    color: "var(--state-stable)",
    bg: "var(--state-stable-bg)",
    animation: "",
    label: "Stable",
    dotSize: "h-1.5 w-1.5",
  },
  celebration: {
    color: "var(--state-protected)",
    bg: "var(--emotion-achievement)",
    animation: "animate-pulse-protected",
    label: "Revenu protégé",
    dotSize: "h-2 w-2",
  },
}

export default function StatePulse({ state, label, size = "sm" }: Props) {
  const cfg = STATE_CONFIG[state] ?? STATE_CONFIG.stable
  const dotClass = size === "sm" ? cfg.dotSize : "h-2 w-2"

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[var(--nav-border)] px-2.5 py-0.5">
      <span
        className={`presence-dot ${dotClass} ${cfg.animation}`}
        style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}40` }}
      />
      <span className="text-[10px] font-medium text-[var(--text-secondary)]">
        {label ?? cfg.label}
      </span>
    </div>
  )
}

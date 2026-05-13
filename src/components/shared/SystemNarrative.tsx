interface Props {
  title: string
  narrative: string
  emotion?: "protective" | "tense" | "calm" | "achievement"
}

export default function SystemNarrative({ title, narrative, emotion }: Props) {
  const accentColor = emotion === "protective"
    ? "var(--success-green)"
    : emotion === "tense"
    ? "var(--risk-red)"
    : emotion === "achievement"
    ? "var(--warning-amber)"
    : "var(--text-primary)"

  return (
    <div className="space-y-1">
      <h1 className="text-display-lg text-[var(--text-primary)]" style={emotion ? { color: accentColor } : undefined}>
        {title}
      </h1>
      <p className="text-narrative">{narrative}</p>
    </div>
  )
}

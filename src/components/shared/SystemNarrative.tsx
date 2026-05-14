import type { SellerStyle } from "@/services/seller-context.service"

interface Props {
  title: string
  narrative: string
  emotion?: "protective" | "tense" | "calm" | "achievement"
  sellerStyle?: SellerStyle
}

const STYLE_ACCENTS: Record<string, string> = {
  stable_operator: "var(--state-stable)",
  fast_responder: "var(--state-protected)",
  high_risk_defender: "var(--state-urgent)",
  momentum_builder: "var(--state-calm)",
  relationship_seller: "var(--psych-reassurance)",
}

export default function SystemNarrative({ title, narrative, emotion, sellerStyle }: Props) {
  const emotionColor = emotion === "protective"
    ? "var(--success-green)"
    : emotion === "tense"
    ? "var(--risk-red)"
    : emotion === "achievement"
    ? "var(--warning-amber)"
    : sellerStyle
    ? STYLE_ACCENTS[sellerStyle] ?? "var(--text-primary)"
    : "var(--text-primary)"

  return (
    <div className="space-y-1">
      <h1 className="text-display-lg text-[var(--text-primary)]" style={{ color: emotionColor }}>
        {title}
      </h1>
      <p className="text-narrative">{narrative}</p>
    </div>
  )
}

"use client";

interface Props {
  risk: "low" | "medium" | "high";
}

const META = {
  low: { bg: "bg-green-500/15", text: "text-green-400", label: "LOW RISK" },
  medium: { bg: "bg-orange-500/15", text: "text-orange-400", label: "MEDIUM RISK" },
  high: { bg: "bg-red-500/15", text: "text-red-400", label: "HIGH RISK" },
};

export default function RiskBadge({ risk }: Props) {
  const m = META[risk];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
}

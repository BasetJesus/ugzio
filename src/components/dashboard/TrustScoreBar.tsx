"use client";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
}

const COLORS = [
  { threshold: 0, bg: "bg-red-500", text: "text-red-400" },
  { threshold: 40, bg: "bg-orange-500", text: "text-orange-400" },
  { threshold: 70, bg: "bg-green-500", text: "text-green-400" },
];

function getColor(score: number) {
  for (let i = COLORS.length - 1; i >= 0; i--) {
    if (score >= COLORS[i].threshold) return COLORS[i];
  }
  return COLORS[0];
}

const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

export default function TrustScoreBar({ score, size = "md" }: Props) {
  const c = getColor(score);
  return (
    <div className="w-full">
      <div className={`w-full overflow-hidden rounded-full bg-zinc-800 ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ${c.bg}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`mt-1 text-xs font-semibold ${c.text}`}>
        {score}/100
      </p>
    </div>
  );
}

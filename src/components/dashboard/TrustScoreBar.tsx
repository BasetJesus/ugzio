"use client";

import { getTrustBarColor, determineTrustLevel } from "@/lib/risk/config";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
}

const TEXT_COLORS = { low: "text-[var(--risk-red)]", medium: "text-orange-400", high: "text-[var(--success-green)]" };
const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

export default function TrustScoreBar({ score, size = "md" }: Props) {
  const level = determineTrustLevel(score);
  return (
    <div className="w-full">
      <div className={`w-full overflow-hidden rounded-full bg-[var(--border)] ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ${getTrustBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`mt-1 text-xs font-semibold ${TEXT_COLORS[level]}`}>
        {score}/100
      </p>
    </div>
  );
}

"use client";

import type { RiskLevel } from "@/types/order";
import { RISK_META } from "@/lib/risk/config";

interface Props {
  risk: RiskLevel;
}

export default function RiskBadge({ risk }: Props) {
  const m = RISK_META[risk];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${m.bg} ${m.color}`}>
      {m.label.toUpperCase()}
    </span>
  );
}

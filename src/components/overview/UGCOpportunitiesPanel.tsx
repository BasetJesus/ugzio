"use client";

import type { UGCOpportunity } from "@/services/overview.service";

function ValueBadge({ estimatedValue }: { estimatedValue: string }) {
  const colors = estimatedValue === "high"
    ? "bg-green-500/15 text-green-400 border-green-500/30"
    : "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase leading-none ${colors}`}>
      {estimatedValue}
    </span>
  );
}

function DayMeter({ days }: { days: number }) {
  const pct = Math.min(100, (days / 14) * 100);
  const color = days <= 5 ? "bg-green-500" : days <= 10 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between text-[10px] text-zinc-600">
        <span>{days} days ago</span>
        <span>{days <= 5 ? "Best time" : days <= 10 ? "Still good" : "Expiring"}</span>
      </div>
      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function UGCOpportunitiesPanel({ opportunities }: { opportunities: UGCOpportunity[] }) {
  if (opportunities.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <p className="text-sm text-zinc-500">No UGC opportunities yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center justify-between border-b border-zinc-800/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-xs">📸</span>
          <h2 className="text-sm font-semibold text-zinc-200">UGC Opportunities</h2>
        </div>
        <span className="text-[11px] text-zinc-600">{opportunities.length} available</span>
      </div>
      <div className="divide-y divide-zinc-800/20">
        {opportunities.map((opp) => (
          <div key={opp.id} className="px-4 py-3 transition hover:bg-zinc-800/20">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-zinc-200">{opp.buyerName}</p>
                  <ValueBadge estimatedValue={opp.estimatedValue} />
                </div>
                <p className="truncate text-[11px] text-zinc-500">{opp.product ?? "—"}</p>
              </div>
              <button
                className="shrink-0 rounded-md bg-purple-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-purple-500"
                onClick={() => window.location.href = `/orders/${opp.orderId}`}
              >
                Ask for UGC
              </button>
            </div>
            <DayMeter days={opp.daysSinceDelivery} />
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import type { RiskAlert } from "@/services/overview.service";
import { SIGNAL_LABELS } from "@/lib/risk/config";
import TrustScoreBar from "@/components/dashboard/TrustScoreBar";

export default function RiskAlertsPanel({ alerts }: { alerts: RiskAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <p className="text-sm text-zinc-500">No risk alerts</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center justify-between border-b border-zinc-800/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/10 text-xs">⚠️</span>
          <h2 className="text-sm font-semibold text-zinc-200">Risk Alerts</h2>
        </div>
        <span className="text-[11px] text-red-400">{alerts.length} need review</span>
      </div>
      <div className="divide-y divide-zinc-800/20">
        {alerts.map((alert) => (
          <div key={alert.id} className="px-4 py-3 transition hover:bg-zinc-800/20">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-zinc-200">{alert.buyerName}</p>
                  <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-400 uppercase leading-none">
                    {alert.riskLevel}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{alert.buyerPhone}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-red-400">{alert.amount.toFixed(1)} TND</p>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1">
                <TrustScoreBar score={alert.trustScore} size="sm" />
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[11px] text-zinc-600">
                Signal: <span className="text-zinc-400">{SIGNAL_LABELS[alert.signal] ?? alert.signal}</span>
              </span>
              <button
                className="rounded-md bg-red-500/10 px-3 py-1 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/20"
                onClick={() => window.location.href = `/orders/${alert.orderId}`}
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

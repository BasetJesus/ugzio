"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ConfirmationQueueItem } from "@/services/confirmation.service";

interface Props {
  items: ConfirmationQueueItem[]
  pendingCount: number
  contactedCount: number
  total: number
}

const RISK_META: Record<string, { color: string; label: string }> = {
  high: { color: "text-red-400", label: "High" },
  medium: { color: "text-amber-400", label: "Med" },
  low: { color: "text-green-400", label: "Low" },
};

export default function ConfirmationPanel({ items, pendingCount, contactedCount, total }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all"
    ? items
    : items.filter((i) => i.confirmStatus === filter);

  async function performAction(orderId: string, action: string) {
    setSubmitting(`${orderId}_${action}`);
    try {
      await fetch(`/api/confirm/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filter === "all" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
        >
          All ({total})
        </button>
        <button
          onClick={() => setFilter("pending_confirmation")}
          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filter === "pending_confirmation" ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("contacted")}
          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filter === "contacted" ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
        >
          Contacted ({contactedCount})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <p className="text-sm text-zinc-500">No orders in this filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const riskMeta = RISK_META[item.riskLevel] ?? RISK_META.medium;
            const isLoading = submitting === `${item.orderId}_confirm` || submitting === `${item.orderId}_unreachable` || submitting === `${item.orderId}_cancel`;
            return (
              <div
                key={item.orderId}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-100">{item.buyerName}</p>
                    <p className="text-xs text-zinc-500">{item.buyerPhone}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[10px] font-semibold ${riskMeta.color}`}>{riskMeta.label}</span>
                      <span className="text-[10px] text-zinc-600">Trust {item.trustScore}</span>
                      <span className="text-[10px] text-green-400/70">{item.amount.toFixed(0)} TND</span>
                      {item.product && (
                        <span className="text-[10px] text-zinc-600 truncate max-w-[100px]">{item.product}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => performAction(item.orderId, "confirm")}
                    disabled={isLoading}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                  >
                    {submitting === `${item.orderId}_confirm` ? "..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => performAction(item.orderId, "unreachable")}
                    disabled={isLoading}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    {submitting === `${item.orderId}_unreachable` ? "..." : "Unreachable"}
                  </button>
                  <button
                    onClick={() => performAction(item.orderId, "cancel")}
                    disabled={isLoading}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    {submitting === `${item.orderId}_cancel` ? "..." : "Cancel"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

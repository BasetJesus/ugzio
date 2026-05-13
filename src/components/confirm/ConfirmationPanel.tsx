"use client";

import { useState } from "react";
import type { ConfirmationQueueItem } from "@/services/confirmation.service";
import ConfirmationDetailDrawer from "./ConfirmationDetailDrawer";

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

const CONFIRM_STATUS_META: Record<string, { label: string; color: string }> = {
  pending_confirmation: { label: "Pending", color: "bg-amber-500/10 text-amber-400" },
  contacted: { label: "Contacted", color: "bg-blue-500/10 text-blue-400" },
  confirmed: { label: "Confirmed", color: "bg-green-500/10 text-green-400" },
  unreachable: { label: "Unreachable", color: "bg-red-500/10 text-red-400" },
  suspicious: { label: "Suspicious", color: "bg-orange-500/10 text-orange-400" },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400" },
};

export default function ConfirmationPanel({ items, pendingCount, contactedCount, total }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all"
    ? items
    : items.filter((i) => i.confirmStatus === filter);

  return (
    <>
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
        <div className="space-y-1">
          {filtered.map((item) => {
            const riskMeta = RISK_META[item.riskLevel] ?? RISK_META.medium;
            const statusMeta = CONFIRM_STATUS_META[item.confirmStatus] ?? { label: item.confirmStatus, color: "bg-zinc-800 text-zinc-400" };
            return (
              <button
                key={item.orderId}
                onClick={() => setSelectedId(item.orderId)}
                className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-zinc-100 truncate">{item.buyerName}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMeta.color}`}>{statusMeta.label}</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{item.buyerPhone}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-semibold ${riskMeta.color} ${riskMeta.label}`}>{riskMeta.label}</span>
                      <span className="text-[10px] text-zinc-600">Trust {item.trustScore}</span>
                      <span className="text-[10px] text-green-400/70">{item.amount.toFixed(0)} TND</span>
                      {item.lastAttemptAt && (
                        <span className="text-[10px] text-zinc-600">{item.lastAttemptOutcome?.replace(/_/g, " ")}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-600 shrink-0">
                    {item.product ? item.product.substring(0, 20) : "—"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <ConfirmationDetailDrawer
        orderId={selectedId}
        onClose={() => setSelectedId(null)}
        onAction={() => {
          // after action, refetch happens via the drawer
        }}
      />
    </>
  );
}

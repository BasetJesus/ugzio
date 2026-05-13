"use client";

import { useState, useEffect, useCallback } from "react";
import type { ConfirmationDetail } from "@/services/confirmation.service";
import ConfirmationTimeline from "./ConfirmationTimeline";

interface Props {
  orderId: string | null
  onClose: () => void
  onAction: () => void
}

const CONFIRM_STATUS_META: Record<string, { label: string; color: string }> = {
  pending_confirmation: { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  contacted: { label: "Contacted", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  confirmed: { label: "Confirmed", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  unreachable: { label: "Unreachable", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  suspicious: { label: "Suspicious", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function ConfirmationDetailDrawer({ orderId, onClose, onAction }: Props) {
  const [detail, setDetail] = useState<ConfirmationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!orderId) { setDetail(null); return }
    setLoading(true);
    fetch(`/api/confirm/${orderId}`)
      .then((r) => r.json())
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [orderId]);

  const performAction = useCallback(async (action: string) => {
    if (!orderId) return;
    setSubmitting(action);
    try {
      await fetch(`/api/confirm/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      setNotes("");
      onAction();
      const r = await fetch(`/api/confirm/${orderId}`);
      setDetail(await r.json());
    } finally {
      setSubmitting(null);
    }
  }, [orderId, notes, onAction]);

  if (!orderId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-zinc-900 border-l border-zinc-800 z-50 overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Confirmation detail</h2>
          <button onClick={onClose} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Close</button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading...</div>
        ) : !detail ? (
          <div className="p-8 text-center text-xs text-zinc-500">Not found</div>
        ) : (
          <div className="p-4 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold text-zinc-100">{detail.order.buyerName}</p>
                <p className="text-sm text-zinc-400">{detail.order.buyerPhone}</p>
                <p className="text-xs text-zinc-500 mt-1">{detail.order.product || "No product"} &middot; {detail.order.amount.toFixed(0)} TND</p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${CONFIRM_STATUS_META[detail.order.confirmStatus]?.color || "text-zinc-400"}`}>
                {CONFIRM_STATUS_META[detail.order.confirmStatus]?.label || detail.order.confirmStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-zinc-800/50 p-2">
                <p className="text-[10px] text-zinc-500 uppercase">Risk</p>
                <p className={`text-sm font-bold mt-0.5 ${detail.order.riskLevel === "high" ? "text-red-400" : detail.order.riskLevel === "medium" ? "text-amber-400" : "text-green-400"}`}>
                  {detail.order.riskLevel}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-2">
                <p className="text-[10px] text-zinc-500 uppercase">Trust</p>
                <p className="text-sm font-bold text-zinc-100 mt-0.5">{detail.order.trustScore}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-2">
                <p className="text-[10px] text-zinc-500 uppercase">Amount</p>
                <p className="text-sm font-bold text-green-400 mt-0.5">{detail.order.amount.toFixed(0)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Risk signals</p>
              <div className="space-y-1">
                {detail.riskExplanation.signals.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2 italic">{detail.riskExplanation.recommendation}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => performAction("confirm")}
                  disabled={!!submitting}
                  className="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                >
                  {submitting === "confirm" ? "Processing..." : "Mark confirmed"}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => performAction("unreachable")}
                    disabled={!!submitting}
                    className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    {submitting === "unreachable" ? "..." : "Unreachable"}
                  </button>
                  <button
                    onClick={() => performAction("suspicious")}
                    disabled={!!submitting}
                    className="rounded-lg border border-orange-500/30 px-3 py-2 text-xs font-medium text-orange-400 hover:bg-orange-500/10 disabled:opacity-50 transition-colors"
                  >
                    {submitting === "suspicious" ? "..." : "Suspicious"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => performAction("retry")}
                    disabled={!!submitting}
                    className="rounded-lg border border-zinc-600 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                  >
                    {submitting === "retry" ? "..." : "Schedule retry"}
                  </button>
                  <button
                    onClick={() => performAction("cancel")}
                    disabled={!!submitting}
                    className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    {submitting === "cancel" ? "..." : "Cancel order"}
                  </button>
                </div>

                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={2}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Contact history</p>
              <ConfirmationTimeline attempts={detail.attempts} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

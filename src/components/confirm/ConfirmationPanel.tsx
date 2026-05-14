"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ConfirmationQueueItem, PendingOutcomeOrder } from "@/services/confirmation.service";
import type { PsychologyPreview } from "@/types/whatsapp";
import type { JourneyTimeline as JourneyTimelineData } from "@/services/buyer-journey.service";
import WhatsAppDecisionCard from "@/components/confirm/WhatsAppDecisionCard";
import PsychologyCard from "@/components/shared/PsychologyCard";
import JourneyTimelineComponent from "@/components/shared/JourneyTimeline";
import ConfettiBurst from "@/components/shared/ConfettiBurst";

interface Props {
  items: ConfirmationQueueItem[]
  pendingCount: number
  contactedCount: number
  total: number
  psychologyMap?: Record<string, PsychologyPreview>
  pendingOutcomes?: PendingOutcomeOrder[]
}

function initials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

function impactMessage(action: string, item: ConfirmationQueueItem): string {
  switch (action) {
    case "confirm": return `+${item.amount.toFixed(0)} TND secured`;
    case "retry": return "Risk neutralized";
    case "cancel": return "Revenue protected";
    default: return "Action completed";
  }
}

function RiskInsightPanel({ item, onClose, onAction, psychologyPreview, timeline, timelineLoading }: {
  item: ConfirmationQueueItem;
  onClose: () => void;
  onAction: (orderId: string, action: string) => void;
  psychologyPreview?: PsychologyPreview;
  timeline?: JourneyTimelineData | null;
  timelineLoading?: boolean;
}) {
  const signals: { label: string; detail: string }[] = [];

  if (item.riskLevel === "high") {
    signals.push({
      label: "Risk score",
      detail: item.trustScore < 40 ? "High — first-time buyer pattern detected" : "High — multiple risk signals",
    });
    if (item.amount > 150) {
      signals.push({ label: "Amount threshold", detail: "Order value exceeds 150 TND safe threshold" });
    }
    signals.push({ label: "Delivery risk", detail: "Above average RTS probability based on buyer profile" });
  } else if (item.riskLevel === "medium") {
    signals.push({ label: "Risk score", detail: "Moderate — some risk indicators present" });
    signals.push({ label: "Delivery risk", detail: "Standard delivery profile with moderate concerns" });
  } else {
    signals.push({ label: "Risk score", detail: "Low — no significant risk signals" });
  }

  return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-full max-w-[28rem] bg-zinc-900 border-l border-white/10 overflow-y-auto shadow-2xl animate-slide-in-right">
          <div className="sticky top-0 bg-zinc-900 border-b border-white/10 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{initials(item.buyerName)}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{item.buyerName}</h3>
                <p className="text-[10px] text-white/40">{item.buyerPhone}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white text-lg leading-none px-2 py-1">&times;</button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Amount</p>
                <p className="text-lg font-bold text-white">{item.amount.toFixed(0)} TND</p>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Trust score</p>
                <p className={`text-lg font-bold ${item.trustScore < 40 ? "text-red-400" : item.trustScore < 70 ? "text-amber-400" : "text-emerald-400"}`}>{item.trustScore}</p>
              </div>
            </div>

            <div className="rounded-xl border p-4 border-red-500/20 bg-red-500/5">
              <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider mb-1">
                If you do nothing
              </p>
              <p className="text-sm font-semibold text-red-300">
                Estimated loss: {Math.round(item.amount * (item.riskLevel === "high" ? 0.65 : 0.35))} TND
              </p>
            </div>

            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Risk signals</p>
              <ul className="space-y-1.5">
                {signals.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                    <div>
                      <p className="text-white font-medium">{s.label}</p>
                      <p className="text-white/50">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Buyer journey</p>
              {timelineLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-white/10 mt-1" />
                      <div className="flex-1 space-y-1 pb-2">
                        <div className="h-3 w-24 bg-white/10 rounded" />
                        <div className="h-2 w-16 bg-white/10 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : timeline && timeline.events.length > 0 ? (
                <JourneyTimelineComponent events={timeline.events} behaviorTags={timeline.behaviorTags} />
              ) : (
                <p className="text-xs text-white/40">No journey data recorded yet</p>
              )}
            </div>

            {psychologyPreview && (
              <div className="rounded-xl bg-[#1a2e2a] border border-green-900/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-medium text-green-400/70 uppercase tracking-wider">WhatsApp Sequence</span>
                  <span className="text-[9px] text-green-600 ml-auto">{psychologyPreview.sequenceType}</span>
                </div>
                <div className="rounded-lg bg-white/[0.05] border border-white/[0.06] p-3">
                  <p className="text-xs text-green-200/70 leading-relaxed">{psychologyPreview.previewMessage}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="rounded-lg bg-black/20 p-2">
                    <p className="text-[9px] text-white/40">Why</p>
                    <p className="text-[10px] text-white/70 mt-0.5">{psychologyPreview.psychologicalReason}</p>
                  </div>
                  <div className="rounded-lg bg-black/20 p-2">
                    <p className="text-[9px] text-white/40">Goal</p>
                    <p className="text-[10px] text-white/70 mt-0.5">{psychologyPreview.expectedGoal}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => { onAction(item.orderId, "confirm"); onClose(); }}
                className="rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors active:scale-[0.97] touch-manipulation"
              >
                Secure
              </button>
              <button
                onClick={() => { onAction(item.orderId, "retry"); onClose(); }}
                className="rounded-lg border border-amber-500/30 py-3 text-sm font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors active:scale-[0.97] touch-manipulation"
              >
                Re-contact
              </button>
              <button
                onClick={() => { onAction(item.orderId, "cancel"); onClose(); }}
                className="rounded-lg border border-red-500/30 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors active:scale-[0.97] touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function ConfirmationPanel({ items, pendingCount, contactedCount, total, psychologyMap, pendingOutcomes }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<{
    item: ConfirmationQueueItem
    psychology?: PsychologyPreview
    timeline?: JourneyTimelineData | null
    timelineLoading?: boolean
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "neutral" | "danger" } | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);

  const filtered = filter === "all"
    ? items
    : items.filter((i) => i.confirmStatus === filter);

  async function performAction(orderId: string, action: string) {
    setSubmitting(`${orderId}_${action}`);
    const item = items.find((i) => i.orderId === orderId);
    try {
      await fetch(`/api/confirm/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const msg = item ? impactMessage(action, item) : "Action completed";
      const type = action === "confirm" || action === "delivered" ? "success" : action === "cancel" || action === "refused" ? "danger" : "neutral";
      if (type === "success") setConfettiActive(true);
      setToast({ message: msg, type });
      setTimeout(() => setToast(null), 2000);
      router.refresh();
    } finally {
      setSubmitting(null);
    }
  }

  function toastStyle(type: string) {
    if (type === "success") return { backgroundColor: "#059669", color: "white" };
    if (type === "danger") return { backgroundColor: "#dc2626", color: "white" };
    return { backgroundColor: "#d97706", color: "white" };
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
          <span className="text-lg">🛡️</span>
        </div>
        <p className="text-sm font-medium text-white">Koul chay t7at l control</p>
        <p className="text-xs text-white/40 mt-1">No orders at risk. UGZIO is monitoring.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar touch-manipulation">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${filter === "all" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-white/40 hover:text-white"}`}
        >
          All ({total})
        </button>
        <button
          onClick={() => setFilter("pending_confirmation")}
          className={`rounded-full px-5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${filter === "pending_confirmation" ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-white/40 hover:text-white"}`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("contacted")}
          className={`rounded-full px-5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${filter === "contacted" ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-white/40 hover:text-white"}`}
        >
          Contacted ({contactedCount})
        </button>
      </div>

      {pendingOutcomes && pendingOutcomes.length > 0 && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-4">
          <p className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider mb-3">
            Delivery pending ({pendingOutcomes.length})
          </p>
          <div className="space-y-2">
            {pendingOutcomes.map((o) => (
              <div
                key={o.orderId}
                className="rounded-lg bg-zinc-900/50 px-4 py-3 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{o.buyerName}</p>
                    <p className="text-[10px] text-white/40">
                      {o.amount.toFixed(0)} TND
                      {o.product ? " — " + o.product : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); performAction(o.orderId, "delivered"); }}
                    disabled={submitting === o.orderId + "_delivered"}
                    className="rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors active:scale-[0.97] touch-manipulation"
                  >
                    {submitting === o.orderId + "_delivered" ? "..." : "✅ Delivered"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); performAction(o.orderId, "refused"); }}
                    disabled={submitting === o.orderId + "_refused"}
                    className="rounded-lg border border-red-500/30 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors active:scale-[0.97] touch-manipulation"
                  >
                    {submitting === o.orderId + "_refused" ? "..." : "🗑️ Refused"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((item) => (
          <WhatsAppDecisionCard
            key={item.orderId}
            item={item}
            psychology={psychologyMap?.[item.orderId]}
            onAction={performAction}
            submitting={submitting}
            onSelect={() => {
              setSelected({ item, psychology: psychologyMap?.[item.orderId], timeline: null, timelineLoading: true })
              fetch("/api/journey/timeline/" + item.orderId)
                .then((r) => r.json())
                .then((data) => setSelected((prev) => prev ? { ...prev, timeline: data, timelineLoading: false } : null))
                .catch(() => setSelected((prev) => prev ? { ...prev, timeline: null, timelineLoading: false } : null))
            }}
          />
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-50 animate-slide-in-top">
          <div className="rounded-lg px-4 py-3 text-xs font-semibold shadow-[var(--shadow-lg)]" style={toastStyle(toast.type)}>
            <div className="flex items-center gap-2">
              <span>{toast.type === "success" ? "✓" : toast.type === "danger" ? "⚠️" : "ℹ"}</span>
              {toast.message}
            </div>
          </div>
        </div>
      )}

      {selected && (
        <RiskInsightPanel
          item={selected.item}
          onClose={() => setSelected(null)}
          onAction={performAction}
          psychologyPreview={selected.psychology}
          timeline={selected.timeline}
          timelineLoading={selected.timelineLoading}
        />
      )}

      <ConfettiBurst active={confettiActive} onComplete={() => setConfettiActive(false)} />
    </div>
  );
}

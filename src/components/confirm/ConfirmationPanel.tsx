"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ConfirmationQueueItem, PendingOutcomeOrder } from "@/services/confirmation.service";
import type { PsychologyPreview } from "@/types/whatsapp";
import type { JourneyTimeline as JourneyTimelineData } from "@/services/buyer-journey.service";
import DecisionCard from "@/components/shared/DecisionCard";
import PsychologyCard from "@/components/shared/PsychologyCard";
import JourneyTimelineComponent from "@/components/shared/JourneyTimeline";

interface Props {
  items: ConfirmationQueueItem[]
  pendingCount: number
  contactedCount: number
  total: number
  psychologyMap?: Record<string, PsychologyPreview>
  pendingOutcomes?: PendingOutcomeOrder[]
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
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border)] overflow-y-auto shadow-2xl animate-slide-in-right">
        <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border)] px-panel py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Order Insight</h3>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-lg leading-none px-2 py-1">&times;</button>
        </div>

        <div className="p-panel space-y-4">
          <div>
            <p className="text-base font-semibold text-[var(--text-primary)]">{item.buyerName}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.buyerPhone}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[var(--bg-surface)] p-3">
              <p className="text-label text-[var(--text-tertiary)]">Amount</p>
              <p className="text-metric text-[var(--text-primary)]">{item.amount.toFixed(0)} TND</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-surface)] p-3">
              <p className="text-label text-[var(--text-tertiary)]">Trust score</p>
              <p className={`text-metric ${item.trustScore < 40 ? "text-[var(--state-urgent)]" : item.trustScore < 70 ? "text-[var(--state-recovering)]" : "text-[var(--state-protected)]"}`}>{item.trustScore}</p>
            </div>
          </div>

          <div
            className="rounded-xl border p-3"
            style={{
              borderColor: item.riskLevel === "high" ? "var(--kpi-red-border)" : "var(--warning-amber-border)",
              backgroundColor: item.riskLevel === "high" ? "var(--kpi-red-bg)" : "var(--warning-amber-bg)",
            }}
          >
            <p className="text-label mb-1" style={{ color: item.riskLevel === "high" ? "var(--state-urgent)" : "var(--state-recovering)" }}>
              If you do nothing
            </p>
            <p className="text-sm font-medium" style={{ color: item.riskLevel === "high" ? "var(--state-urgent)" : "var(--state-recovering)" }}>
              Estimated loss: {Math.round(item.amount * (item.riskLevel === "high" ? 0.65 : 0.35))} TND
            </p>
          </div>

          <div>
            <p className="text-label text-[var(--text-tertiary)] mb-2">Risk signals</p>
            <ul className="space-y-1.5">
              {signals.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--border)]" />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">{s.label}</p>
                    <p className="text-[var(--text-secondary)]">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-label text-[var(--text-tertiary)] mb-2">Buyer journey</p>
            {timelineLoading ? (
              <div className="space-y-2">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-[var(--border)] mt-1" />
                    <div className="flex-1 space-y-1 pb-2">
                      <div className="h-3 w-24 bg-[var(--border)] rounded" />
                      <div className="h-2 w-16 bg-[var(--border)] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : timeline && timeline.events.length > 0 ? (
              <JourneyTimelineComponent events={timeline.events} behaviorTags={timeline.behaviorTags} />
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">No journey data recorded yet</p>
            )}
          </div>

          {psychologyPreview && (
            <PsychologyCard
              sequenceType={psychologyPreview.sequenceType}
              psychologicalReason={psychologyPreview.psychologicalReason}
              expectedGoal={psychologyPreview.expectedGoal}
              previewMessage={psychologyPreview.previewMessage}
            />
          )}

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border)]">
            <button
              onClick={() => { onAction(item.orderId, "confirm"); onClose(); }}
              className="rounded-lg bg-[var(--btn-green)] py-3 text-sm font-semibold text-white hover:bg-[var(--btn-green-hover)] transition-colors btn-base active:scale-[0.97] touch-manipulation"
            >
              Secure Revenue
            </button>
            <button
              onClick={() => { onAction(item.orderId, "retry"); onClose(); }}
              className="rounded-lg border border-[var(--warning-amber)]/30 py-3 text-sm font-semibold text-[var(--warning-amber)] hover:bg-[var(--warning-amber-bg)] transition-colors btn-base active:scale-[0.97] touch-manipulation"
            >
              Re-contact
            </button>
            <button
              onClick={() => { onAction(item.orderId, "cancel"); onClose(); }}
              className="rounded-lg border border-[var(--risk-red)]/30 py-3 text-sm font-semibold text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] transition-colors btn-base active:scale-[0.97] touch-manipulation"
            >
              Prevent Loss
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
      setToast({ message: msg, type });
      setTimeout(() => setToast(null), 2000);
      router.refresh();
    } finally {
      setSubmitting(null);
    }
  }

  function toastStyle(type: string) {
    if (type === "success") return { backgroundColor: "var(--btn-green)", color: "white" };
    if (type === "danger") return { backgroundColor: "var(--btn-red)", color: "white" };
    return { backgroundColor: "var(--warning-amber)", color: "white" };
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-panel text-center">
        <p className="text-sm font-medium text-[var(--text-secondary)]">No revenue at risk right now</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">Your store is stable. UGZIO is still monitoring incoming orders.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar touch-manipulation">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-5 py-2 text-xs font-medium transition-colors whitespace-nowrap btn-base ${filter === "all" ? "bg-[var(--accent)] text-white" : "bg-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        >
          All ({total})
        </button>
        <button
          onClick={() => setFilter("pending_confirmation")}
          className={`rounded-full px-5 py-2 text-xs font-medium transition-colors whitespace-nowrap btn-base ${filter === "pending_confirmation" ? "bg-[var(--warning-amber-bg)] text-[var(--warning-amber)]" : "bg-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("contacted")}
          className={`rounded-full px-5 py-2 text-xs font-medium transition-colors whitespace-nowrap btn-base ${filter === "contacted" ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        >
          Contacted ({contactedCount})
        </button>
      </div>

      {pendingOutcomes && pendingOutcomes.length > 0 && (
        <div className="rounded-xl border border-[var(--success-green-border)] bg-[var(--success-green-bg)] p-4 mb-4">
          <p className="text-label text-[var(--state-protected)] mb-3">
            Mark delivery outcome ({pendingOutcomes.length})
          </p>
          <div className="space-y-2">
            {pendingOutcomes.map((o) => (
              <div
                key={o.orderId}
                className="rounded-lg bg-[var(--bg-card)] px-4 py-3 border border-[var(--border)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{o.buyerName}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {o.amount.toFixed(0)} TND
                      {o.product ? " \u2014 " + o.product : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); performAction(o.orderId, "delivered"); }}
                    disabled={submitting === o.orderId + "_delivered"}
                    className="rounded-lg bg-[var(--btn-green)] py-2.5 text-xs font-semibold text-white hover:bg-[var(--btn-green-hover)] disabled:opacity-50 transition-colors btn-base active:scale-[0.97] touch-manipulation"
                  >
                    {submitting === o.orderId + "_delivered" ? "..." : "Delivered"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); performAction(o.orderId, "refused"); }}
                    disabled={submitting === o.orderId + "_refused"}
                    className="rounded-lg border border-[var(--risk-red)]/30 py-2.5 text-xs font-semibold text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] disabled:opacity-50 transition-colors btn-base active:scale-[0.97] touch-manipulation"
                  >
                    {submitting === o.orderId + "_refused" ? "..." : "Refused"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((item) => (
          <DecisionCard
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
              <span>{toast.type === "success" ? "\u2713" : toast.type === "danger" ? "\u26A0" : "\u2139"}</span>
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
    </div>
  );
}

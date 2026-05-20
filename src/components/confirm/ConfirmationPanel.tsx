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
import EmptyState from "@/components/shared/EmptyState";
import { useToast } from "@/components/shared/Toast";
import { t } from "@/lib/core/copy";

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

const TOAST_KEYS: Record<string, { key: "toast.confirm" | "toast.retry" | "toast.cancel" | "toast.delivered" | "toast.refused"; type: "success" | "error" | "info" }> = {
  confirm: { key: "toast.confirm", type: "success" },
  retry: { key: "toast.retry", type: "info" },
  cancel: { key: "toast.cancel", type: "error" },
  delivered: { key: "toast.delivered", type: "success" },
  refused: { key: "toast.refused", type: "error" },
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
      label: "Score de risque",
      detail: item.trustScore < 40 ? "Élevé — profil de premier achat détecté" : "Élevé — multiples signaux de risque",
    });
    if (item.amount > 150) {
      signals.push({ label: "Seuil de montant", detail: "La commande dépasse le seuil de sécurité de 150 TND" });
    }
    signals.push({ label: "Risque livraison", detail: "Probabilité RTS au-dessus de la moyenne" });
  } else if (item.riskLevel === "medium") {
    signals.push({ label: "Score de risque", detail: "Modéré — quelques indicateurs de risque présents" });
    signals.push({ label: "Risque livraison", detail: "Profil de livraison standard avec quelques préoccupations" });
  } else {
    signals.push({ label: "Score de risque", detail: "Faible — aucun signal de risque significatif" });
  }

  return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-full max-w-[28rem] bg-[var(--bg-base)] border-l border-[var(--border)] overflow-y-auto shadow-2xl animate-slide-in-right">
          <div className="sticky top-0 bg-[var(--bg-base)] border-b border-[var(--border)] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{initials(item.buyerName)}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.buyerName}</h3>
                <p className="text-[10px] text-[var(--text-tertiary)]">{item.buyerPhone}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-lg leading-none px-2 py-1">&times;</button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-[var(--bg-card)] p-3">
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Amount</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{item.amount.toFixed(0)} TND</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-card)] p-3">
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Trust score</p>
                <p className={`text-lg font-bold ${item.trustScore < 40 ? "text-[var(--risk-red)]" : item.trustScore < 70 ? "text-[var(--warning-amber)]" : "text-[var(--success-green)]"}`}>{item.trustScore}</p>
              </div>
            </div>

            <div className="rounded-xl border p-4 border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)]">
                <p className="text-[10px] text-[var(--risk-red)] font-medium uppercase tracking-wider mb-1">
                  {t("label.if-do-nothing")}
                </p>
                <p className="text-sm font-semibold text-[var(--risk-red)]">
                  {t("label.estimated-loss")} : {Math.round(item.amount * (item.riskLevel === "high" ? 0.65 : 0.35))} TND
                </p>
            </div>

            <div>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Risk signals</p>
              <ul className="space-y-1.5">
                {signals.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--text-tertiary)]" />
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">{s.label}</p>
                      <p className="text-[var(--text-secondary)]">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Buyer journey</p>
              {timelineLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-[var(--skeleton-bg)] mt-1" />
                      <div className="flex-1 space-y-1 pb-2">
                        <div className="h-3 w-24 bg-[var(--skeleton-bg)] rounded" />
                        <div className="h-2 w-16 bg-[var(--skeleton-bg)] rounded" />
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
              <div className="rounded-xl bg-[var(--emotion-protection)] border border-green-900/30 p-4">
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
                {t("cta.secure")}
              </button>
              <button
                onClick={() => { onAction(item.orderId, "retry"); onClose(); }}
                className="rounded-lg border border-amber-500/30 py-3 text-sm font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors active:scale-[0.97] touch-manipulation"
              >
                {t("cta.recontact")}
              </button>
              <button
                onClick={() => { onAction(item.orderId, "cancel"); onClose(); }}
                className="rounded-lg border border-red-500/30 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors active:scale-[0.97] touch-manipulation"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function ConfirmationPanel({ items, pendingCount, contactedCount, total, psychologyMap, pendingOutcomes }: Props) {
  const { toastKey } = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<{
    item: ConfirmationQueueItem
    psychology?: PsychologyPreview
    timeline?: JourneyTimelineData | null
    timelineLoading?: boolean
  } | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);

  const filtered = filter === "all"
    ? items
    : items.filter((i) => i.confirmStatus === filter);

  async function performAction(orderId: string, action: string) {
    setSubmitting(`${orderId}_${action}`);
    const item = items.find((i) => i.orderId === orderId);
    try {
      await fetch(`/api/v1/confirm/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const cfg = TOAST_KEYS[action] ?? { key: "toast.confirm", type: "success" };
      if (item) {
        toastKey({ type: cfg.type, key: cfg.key, params: { amount: item.amount.toFixed(0) } });
      }
      if (cfg.type === "success") setConfettiActive(true);
      router.refresh();
    } finally {
      setSubmitting(null);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛡️"
        titleKey="label.confirm-empty"
        descKey="label.confirm-empty-desc"
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar touch-manipulation">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${filter === "all" ? "bg-emerald-600 text-white" : "bg-[var(--bg-card)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        >
          {t("label.all")} ({total})
        </button>
        <button
          onClick={() => setFilter("pending_confirmation")}
          className={`rounded-full px-5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${filter === "pending_confirmation" ? "bg-[var(--state-recovering-bg)] text-[var(--warning-amber)]" : "bg-[var(--bg-card)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        >
          {t("label.pending")} ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("contacted")}
          className={`rounded-full px-5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${filter === "contacted" ? "bg-[var(--state-protected-bg)] text-[var(--success-green)]" : "bg-[var(--bg-card)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        >
          {t("label.contacted")} ({contactedCount})
        </button>
      </div>

      {pendingOutcomes && pendingOutcomes.length > 0 && (
        <div className="rounded-xl border border-[var(--success-green-border)] bg-[var(--state-protected-bg)] p-4 mb-4">
          <p className="text-[10px] font-medium text-[var(--success-green)] uppercase tracking-wider mb-3">
            {t("label.delivery-pending")} ({pendingOutcomes.length})
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
                    {submitting === o.orderId + "_delivered" ? "..." : t("label.outcome-delivered")}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); performAction(o.orderId, "refused"); }}
                    disabled={submitting === o.orderId + "_refused"}
                    className="rounded-lg border border-red-500/30 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors active:scale-[0.97] touch-manipulation"
                  >
                    {submitting === o.orderId + "_refused" ? "..." : t("label.outcome-refused")}
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
              fetch("/api/v1/journey/timeline/" + item.orderId)
                .then((r) => r.json())
                .then((data) => setSelected((prev) => prev ? { ...prev, timeline: data, timelineLoading: false } : null))
                .catch(() => setSelected((prev) => prev ? { ...prev, timeline: null, timelineLoading: false } : null))
            }}
          />
        ))}
      </div>

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

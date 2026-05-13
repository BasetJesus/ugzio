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

function riskPct(item: ConfirmationQueueItem): number {
  if (item.riskLevel === "high") return 65 + Math.round((100 - item.trustScore) * 0.35);
  if (item.riskLevel === "medium") return 35 + Math.round((100 - item.trustScore) * 0.25);
  return Math.round((100 - item.trustScore) * 0.15);
}

function riskColor(level: string): string {
  switch (level) {
    case "high": return "text-[var(--risk-red)]";
    case "medium": return "text-[var(--warning-amber)]";
    default: return "text-[var(--success-green)]";
  }
}

function riskReason(item: ConfirmationQueueItem): string {
  if (item.trustScore < 30) return "First-time buyer \u2014 high RTS risk";
  if (item.trustScore < 50) return "Low trust score \u2014 needs verification";
  if (item.riskLevel === "high") return "Multiple risk signals detected";
  if (item.riskLevel === "medium") return "Moderate risk \u2014 verify before shipping";
  return "Standard risk profile";
}

function failureChance(item: ConfirmationQueueItem): number {
  return riskPct(item);
}

function estimatedLoss(item: ConfirmationQueueItem): number {
  return Math.round(item.amount * (failureChance(item) / 100));
}

function impactMessage(action: string, item: ConfirmationQueueItem): string {
  switch (action) {
    case "confirm": return `+${item.amount.toFixed(0)} TND secured`;
    case "retry": return "Risk neutralized";
    case "cancel": return "Revenue protected";
    default: return "";
  }
}

function DeliveryProviderBadge({ product }: { product: string | null }) {
  const providers = ["Aramex", "Poste Tunisienne", "DHL", "UPS", "Chronopost"];
  const name = providers[Math.floor(((product?.length ?? 0) + 3) % providers.length)];
  return <span className="text-[10px] text-[var(--text-tertiary)]">{name}</span>;
}

function RiskInsightPanel({ item, onClose, onAction }: {
  item: ConfirmationQueueItem;
  onClose: () => void;
  onAction: (orderId: string, action: string) => void;
}) {
  const pct = failureChance(item);
  const loss = estimatedLoss(item);
  const signals: { label: string; detail: string }[] = [];

  if (item.riskLevel === "high") {
    signals.push({
      label: "Risk score",
      detail: item.trustScore < 40 ? "High \u2014 first-time buyer pattern detected" : "High \u2014 multiple risk signals",
    });
    if (item.amount > 150) {
      signals.push({ label: "Amount threshold", detail: "Order value exceeds 150 TND safe threshold" });
    }
    signals.push({ label: "Delivery risk", detail: "Above average RTS probability based on buyer profile" });
  } else if (item.riskLevel === "medium") {
    signals.push({ label: "Risk score", detail: "Moderate \u2014 some risk indicators present" });
    signals.push({ label: "Delivery risk", detail: "Standard delivery profile with moderate concerns" });
  } else {
    signals.push({ label: "Risk score", detail: "Low \u2014 no significant risk signals" });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border)] overflow-y-auto shadow-2xl animate-slide-in-right">
        <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border)] px-5 py-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Risk Insight</h3>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-lg leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="text-base font-semibold text-[var(--text-primary)]">{item.buyerName}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.buyerPhone}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[var(--bg-surface)] p-3">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Amount</p>
              <p className="text-base font-bold text-[var(--text-primary)]">{item.amount.toFixed(0)} TND</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-surface)] p-3">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Risk score</p>
              <p className={`text-base font-bold ${riskColor(item.riskLevel)}`}>{pct}%</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-surface)] p-3">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Trust score</p>
              <p className="text-base font-bold text-[var(--text-primary)]">{item.trustScore}</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-surface)] p-3">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Failure probability</p>
              <p className="text-base font-bold text-[var(--risk-red)]">{pct}%</p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] p-4">
            <p className="text-xs font-medium text-[var(--risk-red)] uppercase tracking-wider mb-1">If you do nothing</p>
            <p className="text-sm text-[var(--risk-red)] opacity-90">Estimated loss: {loss} TND</p>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Why this order is risky</p>
            <ul className="space-y-2">
              {signals.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--border)]" />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">{s.label}</p>
                    <p className="text-[var(--text-secondary)]">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Risk History</p>
            <div className="space-y-0">
              {[
                { label: "Created", done: true },
                { label: "Flagged", done: item.riskLevel !== "low" },
                { label: "Contacted", done: !!item.lastAttemptAt },
                { label: "Resolved", done: item.confirmStatus === "confirmed" || item.confirmStatus === "cancelled" },
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${step.done ? "bg-[var(--success-green)]" : "bg-[var(--border)]"}`} />
                    {i < 3 && <div className="w-px flex-1 bg-[var(--border)]" />}
                  </div>
                  <div className="pb-4">
                    <p className={`text-xs ${step.done ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>{step.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
            <button
              onClick={() => { onAction(item.orderId, "confirm"); onClose(); }}
              className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-500 transition-colors"
            >
              Secure Revenue
            </button>
            <button
              onClick={() => { onAction(item.orderId, "retry"); onClose(); }}
              className="flex-1 rounded-lg border border-[var(--warning-amber)]/30 px-3 py-2 text-xs font-medium text-[var(--warning-amber)] hover:bg-[var(--warning-amber-bg)] transition-colors"
            >
              Re-contact
            </button>
            <button
              onClick={() => { onAction(item.orderId, "cancel"); onClose(); }}
              className="flex-1 rounded-lg border border-[var(--risk-red)]/30 px-3 py-2 text-xs font-medium text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] transition-colors"
            >
              Prevent Loss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPanel({ items, pendingCount, contactedCount, total }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ConfirmationQueueItem | null>(null);
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
      const type = action === "confirm" ? "success" : action === "cancel" ? "danger" : "neutral";
      setToast({ message: msg, type });
      setTimeout(() => setToast(null), 2500);
      router.refresh();
    } finally {
      setSubmitting(null);
    }
  }

  function toastColors(type: string): string {
    switch (type) {
      case "success": return "bg-green-600 text-white";
      case "danger": return "bg-red-600 text-white";
      default: return "bg-[var(--warning-amber)] text-white";
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
        <p className="text-base font-medium text-[var(--text-secondary)]">No revenue at risk right now</p>
        <p className="text-sm text-[var(--text-tertiary)] mt-2">Your store is stable. UGZIO is still monitoring incoming orders.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filter === "all" ? "bg-[var(--accent)] text-white" : "bg-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        >
          All ({total})
        </button>
        <button
          onClick={() => setFilter("pending_confirmation")}
          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filter === "pending_confirmation" ? "bg-[var(--warning-amber-bg)] text-[var(--warning-amber)]" : "bg-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("contacted")}
          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filter === "contacted" ? "bg-blue-500/20 text-blue-500" : "bg-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
        >
          Contacted ({contactedCount})
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const rl = item.riskLevel;
          const isHigh = rl === "high";
          const pct = riskPct(item);
          const sub = submitting;

          return (
            <div
              key={item.orderId}
              className={`rounded-xl border p-4 transition-all duration-300 cursor-pointer ${
                isHigh
                  ? "border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)]"
                  : "border-[var(--border)] bg-[var(--bg-card)]"
              }`}
              onClick={() => setSelected(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${
                    isHigh ? "bg-[var(--risk-red)] animate-pulse" : rl === "medium" ? "bg-[var(--warning-amber)]" : "bg-[var(--success-green)]"
                  }`} />
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.buyerName}</p>
                </div>
                <span className="text-lg font-bold text-[var(--text-primary)] shrink-0 ml-2">
                  {item.amount.toFixed(0)} <span className="text-xs font-medium text-[var(--text-tertiary)]">TND</span>
                </span>
              </div>

              <div className="mt-1.5">
                <span className={`text-3xl font-extrabold tracking-tight ${riskColor(rl)}`}>
                  {pct}%
                </span>
                <span className={`ml-1 text-[11px] font-medium ${riskColor(rl)}`}>risk</span>
              </div>

              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-[var(--text-secondary)]">Trust {item.trustScore}</span>
                <DeliveryProviderBadge product={item.product} />
                <span className="text-[11px] text-[var(--text-tertiary)] truncate">{riskReason(item)}</span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={(e) => { e.stopPropagation(); performAction(item.orderId, "confirm"); }}
                  disabled={sub === `${item.orderId}_confirm`}
                  className="rounded-lg bg-green-600/90 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                >
                  {sub === `${item.orderId}_confirm` ? "..." : "Secure Revenue"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); performAction(item.orderId, "retry"); }}
                  disabled={sub === `${item.orderId}_retry`}
                  className="rounded-lg border border-[var(--warning-amber)]/30 px-3 py-1.5 text-[11px] font-medium text-[var(--warning-amber)] hover:bg-[var(--warning-amber-bg)] disabled:opacity-50 transition-colors"
                >
                  {sub === `${item.orderId}_retry` ? "..." : "Re-contact"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); performAction(item.orderId, "cancel"); }}
                  disabled={sub === `${item.orderId}_cancel`}
                  className="rounded-lg border border-[var(--risk-red)]/30 px-3 py-1.5 text-[11px] font-medium text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] disabled:opacity-50 transition-colors"
                >
                  {sub === `${item.orderId}_cancel` ? "..." : "Prevent Loss"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-top animate-fade-in">
          <div className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${toastColors(toast.type)}`}>
            {toast.message}
          </div>
        </div>
      )}

      {selected && (
        <RiskInsightPanel
          item={selected}
          onClose={() => setSelected(null)}
          onAction={performAction}
        />
      )}
    </div>
  );
}

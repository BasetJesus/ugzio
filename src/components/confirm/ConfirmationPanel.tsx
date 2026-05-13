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

type ImpactLabel = { text: string; color: string; bg: string };

function impactLabel(item: ConfirmationQueueItem): ImpactLabel {
  const cs = item.confirmStatus;
  const rl = item.riskLevel;
  if (cs === "confirmed") return { text: "Revenue secured", color: "text-green-400", bg: "bg-green-500/10" };
  if (cs === "cancelled") return { text: "Loss prevented", color: "text-green-400", bg: "bg-green-500/10" };
  if (rl === "high") return { text: "High chance of RTS", color: "text-red-400", bg: "bg-red-500/10" };
  if (cs === "unreachable") return { text: "Risk remains active", color: "text-amber-400", bg: "bg-amber-500/10" };
  if (cs === "suspicious") return { text: "Flagged — review required", color: "text-red-400", bg: "bg-red-500/10" };
  if (rl === "medium") return { text: "Needs confirmation", color: "text-amber-400", bg: "bg-amber-500/10" };
  return { text: "Safe order", color: "text-green-400", bg: "bg-green-500/10" };
}

function riskPct(item: ConfirmationQueueItem): number {
  if (item.riskLevel === "high") return 65 + Math.round((100 - item.trustScore) * 0.35);
  if (item.riskLevel === "medium") return 35 + Math.round((100 - item.trustScore) * 0.25);
  return Math.round((100 - item.trustScore) * 0.15);
}

function failureChance(item: ConfirmationQueueItem): string {
  const pct = riskPct(item);
  return `${pct}% chance of failed delivery → estimated loss: ${Math.round(item.amount * (pct / 100))} TND`;
}

function riskTimeline(item: ConfirmationQueueItem): { label: string; done: boolean; ts: string }[] {
  const steps: { label: string; done: boolean; ts: string }[] = [
    { label: "Order created", done: true, ts: "completed" },
    { label: "Risk detected", done: item.riskLevel !== "low", ts: item.riskLevel !== "low" ? "completed" : "skipped" },
  ];
  if (item.lastAttemptAt) {
    steps.push({ label: "Contact attempted", done: true, ts: item.lastAttemptAt });
  } else if (item.confirmStatus === "pending_confirmation") {
    steps.push({ label: "Contact pending", done: false, ts: "waiting" });
  } else {
    steps.push({ label: "Contact needed", done: false, ts: "pending" });
  }
  if (item.confirmStatus === "confirmed") {
    steps.push({ label: "Buyer confirmed", done: true, ts: "completed" });
  } else if (item.confirmStatus === "cancelled") {
    steps.push({ label: "Order cancelled — loss prevented", done: true, ts: "completed" });
  } else if (item.confirmStatus === "unreachable") {
    steps.push({ label: "Buyer unreachable — risk remains", done: true, ts: "completed" });
  } else {
    steps.push({ label: "Awaiting decision", done: false, ts: "pending" });
  }
  return steps;
}

function actionFeedback(action: string): string {
  switch (action) {
    case "confirm": return "Revenue secured";
    case "unreachable": return "Risk remains active";
    case "cancel": return "Prevent potential loss";
    default: return "";
  }
}

function DeliveryProviderBadge({ product }: { product: string | null }) {
  const providers = ["Aramex", "Poste Tunisienne", "DHL", "UPS", "Chronopost"];
  const name = providers[Math.floor(((product?.length ?? 0) + 3) % providers.length)];
  return (
    <span className="text-[10px] text-zinc-600">{name}</span>
  );
}

function RiskDetailDrawer({ item, onClose, onAction }: {
  item: ConfirmationQueueItem;
  onClose: () => void;
  onAction: (orderId: string, action: string) => void;
}) {
  const tl = riskTimeline(item);
  const rl = item.riskLevel;
  const signals: string[] = [];
  if (rl === "high") {
    signals.push(item.trustScore < 40 ? "First-time buyer pattern" : "Multiple risk signals detected");
    if (item.amount > 150) signals.push("High amount threshold exceeded");
    signals.push("Delivery risk: above average RTS probability");
  } else if (rl === "medium") {
    signals.push("Moderate risk indicators");
    signals.push("Standard delivery profile");
  } else {
    signals.push("No significant risk signals");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">Order Risk Simulation</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="text-base font-semibold text-zinc-100">{item.buyerName}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{item.buyerPhone}</p>
            {item.product && <p className="text-xs text-zinc-600 mt-0.5">{item.product}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-zinc-800/50 p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Amount</p>
              <p className="text-base font-bold text-zinc-100">{item.amount.toFixed(0)} TND</p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Risk score</p>
              <p className={`text-base font-bold ${
                rl === "high" ? "text-red-400" : rl === "medium" ? "text-amber-400" : "text-green-400"
              }`}>{riskPct(item)}%</p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Trust score</p>
              <p className="text-base font-bold text-zinc-100">{item.trustScore}</p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Status</p>
              <p className="text-base font-bold text-zinc-100">{item.confirmStatus}</p>
            </div>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-1">If you do nothing</p>
            <p className="text-sm text-red-400/90">{failureChance(item)}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Risk breakdown</p>
            <ul className="space-y-1.5">
              {signals.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-500">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-700" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Order Risk Timeline</p>
            <div className="space-y-0">
              {tl.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      step.done ? "bg-green-500" : "bg-zinc-700"
                    }`} />
                    {i < tl.length - 1 && <div className="w-px flex-1 bg-zinc-800" />}
                  </div>
                  <div className="pb-4">
                    <p className={`text-xs ${step.done ? "text-zinc-300" : "text-zinc-600"}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-800">
            <button
              onClick={() => { onAction(item.orderId, "confirm"); onClose(); }}
              className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-500 transition-colors"
            >
              Confirm — Revenue secured
            </button>
            <button
              onClick={() => { onAction(item.orderId, "cancel"); onClose(); }}
              className="flex-1 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Cancel — Prevent loss
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
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const filtered = filter === "all"
    ? items
    : items.filter((i) => i.confirmStatus === filter);

  async function performAction(orderId: string, action: string) {
    setSubmitting(`${orderId}_${action}`);
    setFeedback((prev) => ({ ...prev, [orderId]: actionFeedback(action) }));
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

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
        <p className="text-base font-medium text-zinc-400">No revenue at risk right now</p>
        <p className="text-sm text-zinc-600 mt-2">Your store is stable. UGZIO is still monitoring incoming orders.</p>
      </div>
    );
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

      <div className="space-y-3">
        {filtered.map((item) => {
          const rl = item.riskLevel;
          const isHigh = rl === "high";
          const lbl = impactLabel(item);
          const sub = submitting;
          const feed = feedback[item.orderId];

          return (
            <div
              key={item.orderId}
              className={`rounded-xl border p-4 transition-all duration-300 cursor-pointer hover:border-zinc-700 ${
                isHigh
                  ? "border-red-500/20 bg-red-500/[0.04]"
                  : "border-zinc-800 bg-zinc-900/50"
              }`}
              onClick={() => setSelected(item)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${
                      isHigh ? "bg-red-500 animate-pulse" : rl === "medium" ? "bg-amber-500" : "bg-green-500"
                    }`} />
                    <p className="text-sm font-medium text-zinc-100">{item.buyerName}</p>
                    <span className="text-[10px] text-zinc-600">{item.buyerPhone}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`text-xs font-bold ${
                      isHigh ? "text-red-400" : rl === "medium" ? "text-amber-400" : "text-green-400"
                    }`}>
                      Risk {riskPct(item)}%
                    </span>
                    <span className="text-[10px] text-zinc-600">Trust {item.trustScore}</span>
                    <span className="text-[10px] text-green-400/70">{item.amount.toFixed(0)} TND</span>
                    {item.product && (
                      <span className="text-[10px] text-zinc-600 truncate max-w-[100px]">{item.product}</span>
                    )}
                    <DeliveryProviderBadge product={item.product} />
                  </div>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${lbl.color} ${lbl.bg}`}>
                  {lbl.text}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); performAction(item.orderId, "confirm"); }}
                  disabled={sub === `${item.orderId}_confirm`}
                  className="rounded-lg bg-green-600/90 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                >
                  {sub === `${item.orderId}_confirm` ? "..." : "Confirm — Revenue secured"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); performAction(item.orderId, "unreachable"); }}
                  disabled={sub === `${item.orderId}_unreachable`}
                  className="rounded-lg border border-amber-500/30 px-3 py-1.5 text-[11px] font-medium text-amber-400 hover:bg-amber-500/10 disabled:opacity-50 transition-colors"
                >
                  {sub === `${item.orderId}_unreachable` ? "..." : "Unreachable — Risk active"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); performAction(item.orderId, "cancel"); }}
                  disabled={sub === `${item.orderId}_cancel`}
                  className="rounded-lg border border-red-500/30 px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                >
                  {sub === `${item.orderId}_cancel` ? "..." : "Cancel — Prevent loss"}
                </button>
                {feed && (
                  <span className="text-[10px] font-medium text-green-400 animate-pulse">{feed}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <RiskDetailDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onAction={performAction}
        />
      )}
    </div>
  );
}

"use client";

import { ShieldAlert, MessageSquare, Ban, CheckCircle } from "lucide-react";
import { useState } from "react";
import type { RiskAlertItem, RecentRiskOrder, RiskAggregateStats } from "@/types/risk";

interface Props {
  alerts: RiskAlertItem[];
  aggregate: RiskAggregateStats;
  recentOrders: RecentRiskOrder[];
}

function getAlertMessage(signal: string, buyerName: string): string {
  const messages: Record<string, string> = {
    "first-time-order": `CAUTION: ${buyerName} is a first-time buyer with no history. Request prepayment or verify before shipping.`,
    "high-amount": `RISK: High-value order from ${buyerName}. Consider partial prepayment.`,
    "multiple-orders": `REPEAT FAILURE: ${buyerName} has failed deliveries in the past. Require full prepayment.`,
    "wilaya-risk": `ROUTE RISK: Delivery to ${buyerName}'s area has above-average RTS rate.`,
    "suspicious-phone": `SUSPICIOUS: Phone number pattern matches known bad actors. Verify identity before shipping.`,
  };
  return messages[signal] ?? `ALERT: ${buyerName} flagged by ZioShield. Review before shipping.`;
}

export default function ZioShieldClient({ alerts, aggregate, recentOrders }: Props) {
  const [localAlerts, setLocalAlerts] = useState(alerts);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const showSnackbar = (msg: string) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(null), 3000);
  };

  const displayOrders = localAlerts.length > 0
    ? localAlerts
    : recentOrders.filter((o) => o.riskLevel === "high").slice(0, 10).map((o) => ({
        id: `alert_${o.id}`,
        buyerName: o.buyerName,
        buyerPhone: o.buyerPhone,
        amount: o.amount,
        riskLevel: o.riskLevel,
        trustScore: o.trustScore,
        signal: "first-time-order",
        orderId: o.id,
      }));

  const handleBlacklist = async (phone: string) => {
    try {
      const res = await fetch("/api/v1/zioshield/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setLocalAlerts((prev) => prev.filter((a) => a.buyerPhone !== phone));
        showSnackbar("Phone blacklisted successfully");
      } else {
        showSnackbar("Failed to blacklist phone");
      }
    } catch {
      showSnackbar("Network error");
    }
  };

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent("Hello, this is regarding your order.")}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-space text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          ZioShield <span className="text-[var(--accent)]">Risk Guard</span>
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-inter mt-1">
          Stop fake cash-on-delivery orders before they waste your logistics capital.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-space">Total Orders</p>
          <p className="text-xl font-bold font-space text-[var(--text-primary)] mt-1">{aggregate.totalOrders}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-space">High Risk</p>
          <p className="text-xl font-bold font-space text-[var(--status-danger)] mt-1">{aggregate.highRiskCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-space">Revenue at Risk</p>
          <p className="text-xl font-bold font-space text-[var(--status-warning)] mt-1">{aggregate.revenueAtRisk.toLocaleString()} TND</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-space">Today Orders</p>
          <p className="text-xl font-bold font-space text-[var(--accent)] mt-1">{aggregate.todayOrders}</p>
        </div>
      </div>

      {displayOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle className="h-10 w-10 text-[var(--status-success)] mb-3" />
          <p className="text-sm text-[var(--text-muted)] font-inter">No high-risk orders detected. Your revenue is protected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-space">
            Flagged Orders ({displayOrders.length})
          </h3>
          {displayOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[var(--text-tertiary)]">#{order.orderId.slice(-6)}</span>
                    {order.riskLevel === "high" && <ShieldAlert className="h-3.5 w-3.5 text-[var(--status-danger)]" />}
                  </div>
                  <h3 className="font-space text-sm font-bold text-[var(--text-primary)] truncate">{order.buyerName}</h3>
                  <p className="text-[11px] text-[var(--text-secondary)] font-inter">{order.amount.toLocaleString()} TND · Trust: {order.trustScore}%</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-[9px] font-bold block font-space tracking-wider text-[var(--text-tertiary)] uppercase">RISK</span>
                  <span className={`text-lg font-bold font-space ${order.riskLevel === "high" ? "text-[var(--status-danger)]" : "text-[var(--status-success)]"}`}>
                    {100 - order.trustScore}%
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-[var(--status-danger-bg)] border border-[var(--status-danger)]/20 p-2.5 flex gap-2 items-start">
                <ShieldAlert className="h-4 w-4 text-[var(--status-danger)] shrink-0 mt-0.5" />
                <p className="text-[11px] font-inter text-[var(--status-danger)] leading-normal font-medium">
                  {getAlertMessage(order.signal, order.buyerName)}
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleWhatsApp(order.buyerPhone)}
                  className="flex-1 h-10 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[11px] font-space font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform text-[var(--text-primary)]"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[var(--accent)]" />
                  WHATSAPP CONFIRM
                </button>
                <button
                  onClick={() => handleBlacklist(order.buyerPhone)}
                  className="h-10 px-3 bg-[var(--status-danger-bg)] border border-[var(--status-danger)]/30 text-[var(--status-danger)] rounded-lg text-[11px] font-space font-bold active:scale-[0.97] transition-transform flex items-center gap-1.5"
                >
                  <Ban className="h-3.5 w-3.5" />
                  BLACKLIST
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {snackbar && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] shadow-lg z-50 font-space animate-in fade-in">
          {snackbar}
        </div>
      )}
    </div>
  );
}

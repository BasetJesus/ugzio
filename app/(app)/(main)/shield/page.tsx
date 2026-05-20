"use client";

import { ShieldAlert, MessageSquare } from "lucide-react";

const mockOrders = [
  { id: "#4102", buyer: "Amine K.", route: "Sfax", score: 92, status: "CRITICAL", alert: "CRITICAL: High risk profile. Request 30% prepayment via Flouci/D17 before shipping." },
  { id: "#4101", buyer: "Fatma B.", route: "Tunis", score: 4, status: "SAFE", alert: null }
];

export default function ZioShield() {
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

      <div className="space-y-3">
        {mockOrders.map((order) => (
          <div key={order.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[var(--text-tertiary)]">{order.id}</span>
                <h3 className="font-space text-sm font-bold text-[var(--text-primary)]">{order.buyer}</h3>
                <p className="text-[11px] text-[var(--text-secondary)] font-inter">Route: {order.route} (COD)</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold block font-space tracking-wider text-[var(--text-tertiary)] uppercase">RTS RISK</span>
                <span className={`text-xl font-bold font-space ${order.status === "CRITICAL" ? "text-[var(--status-danger)]" : "text-[var(--status-success)]"}`}>
                  {order.score}%
                </span>
              </div>
            </div>

            {order.alert && (
              <div className="rounded-lg bg-[var(--status-danger-bg)] border border-[var(--status-danger)]/20 p-2.5 flex gap-2 items-start">
                <ShieldAlert className="h-4 w-4 text-[var(--status-danger)] shrink-0 mt-0.5" />
                <p className="text-[11px] font-inter text-[var(--status-danger)] leading-normal font-medium">
                  {order.alert}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button className="flex-1 h-10 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[11px] font-space font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform text-[var(--text-primary)]">
                <MessageSquare className="h-3.5 w-3.5 text-[var(--accent)]" />
                WHATSAPP CONFIRM
              </button>
              {order.status === "CRITICAL" && (
                <button className="h-10 px-3 bg-[var(--status-danger-bg)] border border-[var(--status-danger)]/30 text-[var(--status-danger)] rounded-lg text-[11px] font-space font-bold active:scale-[0.97] transition-transform">
                  ZioGuard BLACKLIST
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

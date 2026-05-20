"use client";

import { TrendingDown, Shield, DollarSign, Package, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  color: string;
  icon: typeof Shield;
}

interface RiskCategory {
  label: string;
  pct: number;
  amount: number;
  color: string;
}

interface Event {
  id: string;
  type: "saved" | "blocked" | "confirmed";
  buyer: string;
  amount: number;
  time: string;
}

const stats: StatCard[] = [
  { label: "Revenue Protected", value: "8,450 TND", change: 12.5, trend: "up", color: "text-[var(--status-success)]", icon: DollarSign },
  { label: "Orders Saved", value: "47", change: 8.3, trend: "up", color: "text-[var(--status-info)]", icon: Package },
  { label: "RTS Prevention Rate", value: "94.2%", change: 2.1, trend: "up", color: "text-[var(--status-success)]", icon: Target },
  { label: "At Risk Today", value: "1,280 TND", change: 5.7, trend: "down", color: "text-[var(--status-danger)]", icon: TrendingDown },
];

const riskBreakdown: RiskCategory[] = [
  { label: "High Risk (flagged)", pct: 12, amount: 3400, color: "bg-[var(--status-danger)]" },
  { label: "Medium Risk (monitor)", pct: 28, amount: 5200, color: "bg-[var(--warning-amber)]" },
  { label: "Low Risk (safe)", pct: 60, amount: 11200, color: "bg-[var(--status-success)]" },
];

const recentEvents: Event[] = [
  { id: "e1", type: "blocked", buyer: "Ahmed R.", amount: 320, time: "2m ago" },
  { id: "e2", type: "confirmed", buyer: "Fatma B.", amount: 129, time: "15m ago" },
  { id: "e3", type: "saved", buyer: "Mohamed K.", amount: 245, time: "1h ago" },
  { id: "e4", type: "blocked", buyer: "Sami T.", amount: 180, time: "2h ago" },
  { id: "e5", type: "confirmed", buyer: "Yasmine M.", amount: 89, time: "3h ago" },
];

const eventConfig = {
  saved: { label: "SAVED", color: "text-[var(--status-success)]", bg: "bg-[var(--status-success-bg)]", icon: Shield },
  blocked: { label: "BLOCKED", color: "text-[var(--status-danger)]", bg: "bg-[var(--status-danger-bg)]", icon: TrendingDown },
  confirmed: { label: "CONFIRMED", color: "text-[var(--status-info)]", bg: "bg-[var(--status-info-bg)]", icon: ArrowUpRight },
};

export default function ZioStats() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-space text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Zio<span className="text-[var(--accent)]">Stats</span>
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-inter mt-1">
          Live revenue protection metrics — what UGZIO saved you today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-space">
                  {s.label}
                </span>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className={`text-xl font-bold font-space tracking-tight ${s.color}`}>{s.value}</p>
              <div className="flex items-center gap-1">
                {s.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-[var(--status-success)]" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-[var(--status-danger)]" />
                )}
                <span className={`text-[10px] font-semibold font-inter ${s.trend === "up" ? "text-[var(--status-success)]" : "text-[var(--status-danger)]"}`}>
                  {s.change}%
                </span>
                <span className="text-[9px] text-[var(--text-muted)] font-inter">vs yesterday</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-space">
          Risk Distribution
        </h3>
        <div className="space-y-3">
          {riskBreakdown.map((r, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] font-inter">{r.label}</span>
                <span className="text-[10px] font-bold text-[var(--text-primary)] font-space">
                  {r.pct}% · {r.amount.toLocaleString()} TND
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${r.color}`} style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-space">
            Protection Activity Feed
          </h3>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)] animate-pulse" />
        </div>
        <div className="space-y-2">
          {recentEvents.map((event) => {
            const cfg = eventConfig[event.type];
            const Icon = cfg.icon;
            return (
              <div key={event.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <div className={`h-8 w-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] font-space truncate">{event.buyer}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-space`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-inter">{event.amount.toLocaleString()} TND · {event.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

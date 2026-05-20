"use client";

import {
  TrendingDown, Shield, DollarSign, Package, Target,
  ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, MessageSquare
} from "lucide-react";
import type { RevenueProtectionStats, ProtectedRevenueBreakdown } from "@/services/revenue-protection.service";
import type { OutcomeStats } from "@/services/operation-outcome.service";
import type { OverviewData } from "@/services/overview.service";

interface Props {
  rpStats: RevenueProtectionStats;
  todayProtected: ProtectedRevenueBreakdown[];
  allTimeOutcomes: OutcomeStats;
  overview: OverviewData;
}

const eventConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Shield }> = {
  confirm: { label: "SAVED", color: "text-[var(--status-success)]", bg: "bg-[var(--status-success-bg)]", icon: CheckCircle },
  cancel: { label: "BLOCKED", color: "text-[var(--status-danger)]", bg: "bg-[var(--status-danger-bg)]", icon: XCircle },
  unreachable: { label: "UNREACHABLE", color: "text-[var(--status-warning)]", bg: "bg-[var(--status-warning-bg)]", icon: MessageSquare },
  suspicious: { label: "FLAGGED", color: "text-[var(--status-danger)]", bg: "bg-[var(--status-danger-bg)]", icon: Shield },
  retry: { label: "RETRY", color: "text-[var(--status-info)]", bg: "bg-[var(--status-info-bg)]", icon: ArrowUpRight },
};

export default function StatsClient({ rpStats, todayProtected, allTimeOutcomes, overview }: Props) {
  const riskBreakdown = [
    { label: "High Risk", pct: overview.stats.atRiskOrders > 0 ? Math.round((overview.stats.atRiskOrders / (overview.stats.ordersThisWeek || 1)) * 100) : 0, amount: rpStats.totalRevenueAtRisk, color: "bg-[var(--status-danger)]" },
    { label: "Pending Verification", pct: overview.stats.pendingVerifications > 0 ? Math.round((overview.stats.pendingVerifications / (overview.stats.ordersThisWeek || 1)) * 100) : 0, amount: 0, color: "bg-[var(--warning-amber)]" },
    { label: "Safe (delivered)", pct: overview.stats.deliveredRate, amount: overview.stats.revenueThisWeek, color: "bg-[var(--status-success)]" },
  ];

  const kpis = [
    { label: "Revenue Protected", value: `${allTimeOutcomes.revenueSaved.toLocaleString()} TND`, change: overview.stats.ordersThisWeek > 0 ? Math.round((allTimeOutcomes.revenueSaved / (overview.stats.revenueThisWeek || 1)) * 100) : 0, trend: "up" as const, color: "text-[var(--status-success)]" as const, icon: DollarSign },
    { label: "Orders Saved", value: `${allTimeOutcomes.confirmations}`, change: rpStats.highRiskOrders > 0 ? Math.round((allTimeOutcomes.confirmations / rpStats.highRiskOrders) * 100) : 0, trend: "up" as const, color: "text-[var(--status-info)]" as const, icon: Package },
    { label: "RTS Prevention Rate", value: `${rpStats.highRiskOrders > 0 ? Math.round((allTimeOutcomes.confirmations / rpStats.highRiskOrders) * 100) : 0}%`, change: allTimeOutcomes.confirmationRate, trend: "up" as const, color: "text-[var(--status-success)]" as const, icon: Target },
    { label: "At Risk Today", value: `${rpStats.totalRevenueAtRisk.toLocaleString()} TND`, change: rpStats.highRiskOrders, trend: "down" as const, color: "text-[var(--status-danger)]" as const, icon: TrendingDown },
  ];

  const recentEvents = todayProtected.slice(0, 10);

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
        {kpis.map((s, i) => {
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
                <span className="text-[9px] text-[var(--text-muted)] font-inter">vs period</span>
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
                <div className={`h-full rounded-full transition-all duration-700 ${r.color}`} style={{ width: `${Math.min(r.pct, 100)}%` }} />
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
        {recentEvents.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] font-inter text-center py-6">No activity today yet</p>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((event) => {
              const cfg = eventConfig[event.action] || eventConfig["confirm"];
              const Icon = cfg.icon;
              return (
                <div key={event.orderId + event.timestamp} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                  <div className={`h-8 w-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text-primary)] font-space truncate">#{event.orderId.slice(-6)}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-space`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-tertiary)] font-inter">{event.estimatedSaved.toLocaleString()} TND saved · {new Date(event.timestamp).toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

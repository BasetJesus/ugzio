"use client";

import { Sparkles, Target, TrendingUp, Users, Image, Send } from "lucide-react";
import type { GrowthMetrics } from "@/services/growth.service";
import type { LoopCompletionStats } from "@/services/overview.service";

interface UgcOpportunity {
  orderId: string;
  buyerName: string;
  amount: number;
  score: number;
  label: string;
  requestType: string;
}

interface FlowStats {
  totalPublished: number;
  totalQueued: number;
  byPlatform: { platform: string; count: number }[];
}

interface Props {
  metrics: GrowthMetrics;
  opportunities: UgcOpportunity[];
  flowStats: FlowStats;
  loopStats: LoopCompletionStats;
}

const SCORE_COLORS: Record<string, string> = {
  high: "text-[var(--status-success)]",
  medium: "text-[var(--warning-amber)]",
  low: "text-[var(--text-muted)]",
};

const SCORE_BG: Record<string, string> = {
  high: "bg-[var(--status-success-bg)]",
  medium: "bg-[var(--warning-amber-bg)]",
  low: "bg-[var(--bg-surface)]",
};

export default function GrowthViewClient({ metrics, opportunities, flowStats, loopStats }: Props) {
  const kpis = [
    { label: "UGC Requests", value: metrics.requestsSent, icon: Send, color: "text-[var(--text-primary)]" },
    { label: "Response Rate", value: `${metrics.responseRate}%`, icon: Users, color: metrics.responseRate >= 50 ? "text-[var(--status-success)]" : "text-[var(--warning-amber)]" },
    { label: "Approved", value: metrics.totalApproved, icon: Image, color: "text-[var(--status-success)]" },
    { label: "Published", value: flowStats.totalPublished, icon: TrendingUp, color: "text-[var(--accent)]" },
    { label: "Loop Rate", value: `${loopStats.completionRate}%`, icon: Target, color: loopStats.completionRate >= 50 ? "text-[var(--status-success)]" : "text-[var(--text-primary)]" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-space text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Zio<span className="text-[var(--accent)]">View</span>
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-inter mt-1">
          Growth & UGC performance — how your customer content drives results.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[7px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-space">{k.label}</span>
              <k.icon className={`h-3 w-3 ${k.color}`} />
            </div>
            <p className={`text-lg font-bold font-space ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {metrics.topProducts.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
          <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-space flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Top UGC Products
          </h3>
          <div className="space-y-2">
            {metrics.topProducts.map((p, i) => (
              <div key={p.product} className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] w-4 shrink-0 font-space">#{i + 1}</span>
                  <span className="text-xs text-[var(--text-primary)] font-inter truncate">{p.product}</span>
                </div>
                <span className="text-[10px] font-bold text-[var(--accent)] font-space shrink-0 ml-3">{p.count} UGC</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {opportunities.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
          <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-space flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-[var(--status-info)]" />
            UGC Opportunities
          </h3>
          <p className="text-[10px] text-[var(--text-tertiary)] font-inter -mt-1">
            These buyers are most likely to submit content. Request UGC now.
          </p>
          <div className="space-y-2">
            {opportunities.map((o) => (
              <div key={o.orderId} className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--text-primary)] font-space truncate">{o.buyerName}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-inter">{o.amount} TND · {o.requestType.replace(/_/g, " ")}</p>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${SCORE_BG[o.label]} ${SCORE_COLORS[o.label]} font-space shrink-0 ml-2`}>
                  {o.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-space">
          Core Loop Health
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider font-space">Completed</p>
            <p className="text-lg font-bold font-space text-[var(--text-primary)]">{loopStats.totalCompleted}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider font-space">Successful</p>
            <p className="text-lg font-bold font-space text-[var(--status-success)]">{loopStats.successfulCompletions}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider font-space">Signals</p>
            <p className="text-lg font-bold font-space text-[var(--accent)]">{loopStats.learningSignals}</p>
          </div>
        </div>
      </div>

      {!metrics.requestsSent && !opportunities.length && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="h-8 w-8 text-[var(--text-muted)] mb-2" />
          <p className="text-xs text-[var(--text-muted)] font-inter">No growth data yet. Start by requesting UGC from your delivered buyers.</p>
        </div>
      )}
    </div>
  );
}

"use client";

import type { OverviewStats } from "@/services/overview.service";

interface CardDef {
  label: string;
  value: string | number;
  icon: string;
  accent: "green" | "red" | "amber" | "purple" | "zinc";
  trend?: { dir: "up" | "down"; pct: number };
}

const ACCENT_MAP: Record<string, string> = {
  green: "text-green-400 border-green-500/20 bg-green-500/5",
  red: "text-red-400 border-red-500/20 bg-red-500/5",
  amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  purple: "text-purple-400 border-purple-500/20 bg-purple-500/5",
  zinc: "text-zinc-400 border-zinc-500/20 bg-zinc-500/5",
};

function Card({ label, value, icon, accent, trend }: CardDef) {
  return (
    <div className={`rounded-xl border p-4 ${ACCENT_MAP[accent]}`}>
      <div className="flex items-start justify-between">
        <span className="text-lg">{icon}</span>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trend.dir === "up" ? "text-green-400" : "text-red-400"}`}>
            {trend.dir === "up" ? "↑" : "↓"} {trend.pct}%
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

export default function StatsCards({ stats }: { stats: OverviewStats }) {
  const cards: CardDef[] = [
    { label: "Orders Today", value: stats.ordersToday, icon: "📦", accent: "green", trend: { dir: "up", pct: 12 } },
    { label: "Revenue Today", value: `${stats.revenueToday.toFixed(0)} TND`, icon: "💰", accent: "green", trend: { dir: "up", pct: 8 } },
    { label: "At Risk", value: stats.atRiskOrders, icon: "⚠️", accent: "red" },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: "📤", accent: "amber" },
    { label: "UGC Received", value: stats.ugcReceived, icon: "📸", accent: "purple", trend: { dir: "up", pct: 24 } },
    { label: "Delivered Rate", value: `${stats.deliveredRate}%`, icon: "✅", accent: "green", trend: { dir: "up", pct: 3 } },
    { label: "Orders This Week", value: stats.ordersThisWeek, icon: "📊", accent: "zinc" },
    { label: "Revenue This Week", value: `${stats.revenueThisWeek.toFixed(0)} TND`, icon: "📈", accent: "zinc" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {cards.map((card) => (
        <Card key={card.label} {...card} />
      ))}
    </div>
  );
}

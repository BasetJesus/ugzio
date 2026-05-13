"use client";

import type { LiveOrder } from "@/services/overview.service";
import { RISK_META } from "@/lib/risk/config";
import TrustScoreBar from "@/components/dashboard/TrustScoreBar";

const STATUS_COLORS: Record<string, string> = {
  CREATED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PRE_SHIPPING_CONFIRM_SENT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  BUYER_CONFIRMED: "bg-green-500/20 text-green-400 border-green-500/30",
  SHIPPED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
};

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase leading-none ${colors}`}>
      {status === "PRE_SHIPPING_CONFIRM_SENT" ? "CONFIRM SENT" : status}
    </span>
  );
}

function RiskDot({ level }: { level: string }) {
  const meta = RISK_META[level as keyof typeof RISK_META] ?? RISK_META.low;
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} />;
}

function OrderRow({ order }: { order: LiveOrder }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2.5 transition hover:bg-zinc-800/30">
      <RiskDot level={order.riskLevel} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-zinc-200">{order.buyerName}</p>
          <StatusBadge status={order.status} />
        </div>
        <p className="truncate text-[11px] text-zinc-500">{order.product ?? order.buyerPhone}</p>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        <div className="w-16">
          <TrustScoreBar score={order.trustScore} size="sm" />
        </div>
        <span className="w-16 text-right text-[11px] text-zinc-500">{order.createdAt ? formatTimeAgo(order.createdAt) : ""}</span>
      </div>
      <p className="shrink-0 text-right text-sm font-semibold text-green-400">{order.amount.toFixed(3)}</p>
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function LiveOrdersFeed({ orders }: { orders: LiveOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <p className="text-sm text-zinc-500">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center justify-between border-b border-zinc-800/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500/10 text-xs">📦</span>
          <h2 className="text-sm font-semibold text-zinc-200">Live Orders</h2>
        </div>
        <span className="text-[11px] text-zinc-600">{orders.length} active</span>
      </div>
      <div className="divide-y divide-zinc-800/20 px-3">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import TrustScoreBar from "@/components/dashboard/TrustScoreBar";
import RiskBadge from "@/components/dashboard/RiskBadge";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import SearchBar from "@/components/shared/SearchBar";
import FilterDropdown from "@/components/shared/FilterDropdown";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface Order {
  id: string
  buyerName: string
  buyerPhone: string
  buyerWilaya: string | null
  amount: number
  riskLevel: string
  trustScore: number
  status: string
  product: string | null
  createdAt: string
}

const STATUS_OPTIONS = [
  { value: "CREATED", label: "Created" },
  { value: "PRE_SHIPPING_CONFIRM_SENT", label: "Confirm Sent" },
  { value: "BUYER_CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REFUSED", label: "Refused" },
  { value: "INTELLIGENT_CANCEL", label: "Cancelled" },
]

const RISK_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  useEffect(() => {
    fetch("/api/v1/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      if (q && !o.buyerName.toLowerCase().includes(q) && !o.buyerPhone.includes(q) && !(o.id?.toLowerCase().includes(q))) return false;
      if (statusFilter && o.status !== statusFilter) return false;
      if (riskFilter && o.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter, riskFilter]);

  if (loading) return <div className="p-4 sm:p-6"><LoadingSkeleton lines={6} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-green-500/10 text-xs">📤</span>
          <h1 className="text-xl font-bold text-zinc-100">Orders</h1>
        </div>
        <Link
          href="/orders/new"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
        >
          + New
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, phone, or ID..." />
        </div>
        <div className="flex gap-2">
          <FilterDropdown label="All Statuses" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          <FilterDropdown label="All Risk" options={RISK_OPTIONS} value={riskFilter} onChange={setRiskFilter} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={orders.length === 0 ? "No orders yet" : "No orders match your filters"}
          description={orders.length === 0 ? "Create your first order to get started." : "Try adjusting your search or filters."}
          action={orders.length === 0 ? { label: "Create Order", href: "/orders/new" } : undefined}
        />
      ) : (
        <div className="divide-y divide-zinc-800/40">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-start justify-between gap-4 px-1 py-3 transition hover:bg-zinc-800/20 -mx-1 rounded"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-zinc-200">{order.buyerName}</p>
                  <span className="text-[10px] text-zinc-700">{order.id.slice(0, 8)}</span>
                </div>
                <p className="truncate text-xs text-zinc-500">{order.buyerPhone}</p>
                <p className="mt-0.5 text-xs text-zinc-600">{order.product ?? order.buyerWilaya ?? "—"}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-medium text-green-400">{Number(order.amount).toFixed(3)} TND</p>
                <div className="mt-1 flex items-center justify-end gap-1.5">
                  <OrderStatusBadge status={order.status} />
                  <RiskBadge risk={order.riskLevel as "low" | "medium" | "high"} />
                </div>
                <div className="mt-2 w-20 ml-auto">
                  <TrustScoreBar score={order.trustScore} size="sm" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

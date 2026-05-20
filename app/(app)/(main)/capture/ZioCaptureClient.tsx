"use client";

import { useState, useCallback } from "react";
import type { UgcItemSummary, UgcStats } from "@/services/grow.service";
import {
  CheckCircle, XCircle, Image, Download, Filter,
} from "lucide-react";

interface Props {
  items: UgcItemSummary[];
  stats: UgcStats;
}

type FilterMode = "all" | "received" | "approved" | "rejected";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  received: { label: "PENDING", color: "text-[var(--warning-amber)]", bg: "bg-[var(--warning-amber-bg)]" },
  approved: { label: "APPROVED", color: "text-[var(--status-success)]", bg: "bg-[var(--status-success-bg)]" },
  rejected: { label: "REJECTED", color: "text-[var(--status-danger)]", bg: "bg-[var(--status-danger-bg)]" },
};

function UgcCard({ item, onAction, acting }: {
  item: UgcItemSummary;
  onAction: (id: string, action: "approve" | "reject") => void;
  acting: string | null;
}) {
  const isActing = acting === item.id;
  const st = STATUS_STYLES[item.status] || STATUS_STYLES.received;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="aspect-[4/3] bg-[var(--bg-surface)] flex items-center justify-center overflow-hidden">
        {item.mediaType === "image" ? (
          <img src={item.mediaUrl} alt={`UGC by ${item.buyerName}`} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <video src={item.mediaUrl} className="w-full h-full object-cover" preload="metadata" playsInline controls />
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--text-primary)] font-space truncate">{item.buyerName}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] font-inter">{item.product ?? "Unknown product"}</p>
          </div>
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${st.bg} ${st.color} font-space shrink-0 ml-2`}>
            {st.label}
          </span>
        </div>

        <p className="text-[10px] text-[var(--text-secondary)] font-inter">
          {item.amount.toFixed(0)} TND · {new Date(item.createdAt).toLocaleDateString("fr-TN")}
        </p>

        {item.status === "received" && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onAction(item.id, "approve")}
              disabled={isActing}
              className="h-9 rounded-lg bg-[var(--status-success)] text-white text-[10px] font-bold font-space flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.97] transition-transform"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {isActing ? "..." : "APPROVE"}
            </button>
            <button
              onClick={() => onAction(item.id, "reject")}
              disabled={isActing}
              className="h-9 rounded-lg border border-[var(--status-danger)]/30 text-[var(--status-danger)] text-[10px] font-bold font-space flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.97] transition-transform"
            >
              <XCircle className="h-3.5 w-3.5" />
              {isActing ? "..." : "REJECT"}
            </button>
          </div>
        )}

        {item.status === "approved" && (
          <a
            href={item.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] items-center justify-center gap-1.5 text-[10px] font-bold font-space text-[var(--text-secondary)] active:scale-[0.97] transition-transform"
          >
            <Download className="h-3.5 w-3.5" />
            DOWNLOAD
          </a>
        )}
      </div>
    </div>
  );
}

export default function ZioCaptureClient({ items, stats }: Props) {
  const [localItems, setLocalItems] = useState(items);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");
  const handleAction = useCallback(async (id: string, action: "approve" | "reject") => {
    setActing(id);
    try {
      const res = await fetch(`/api/v1/ugc/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setLocalItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: data.status } : i)));
      }
    } finally {
      setActing(null);
    }
  }, []);

  const filtered = filter === "all" ? localItems : localItems.filter((i) => i.status === filter);

  const kpis = [
    { label: "Total", value: stats.total },
    { label: "Pending", value: stats.received, color: stats.received > 0 ? "text-[var(--warning-amber)]" : "text-[var(--text-primary)]" },
    { label: "Approved", value: stats.approved, color: "text-[var(--status-success)]" },
    { label: "Rate", value: `${stats.rate}%` },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-2">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
            <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-space">{k.label}</p>
            <p className={`text-lg font-bold font-space mt-0.5 ${k.color || "text-[var(--text-primary)]"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "received", "approved", "rejected"] as FilterMode[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-space transition-all border shrink-0 ${
              filter === f
                ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)]"
            }`}
          >
            <Filter className="h-3 w-3 inline mr-1" />
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && ` (${f === "received" ? stats.received : f === "approved" ? stats.approved : stats.rejected})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Image className="h-10 w-10 text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-muted)] font-inter">
            {filter === "all" ? "No UGC content yet" : `No ${filter} content`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <UgcCard key={item.id} item={item} onAction={handleAction} acting={acting} />
          ))}
        </div>
      )}
    </div>
  );
}

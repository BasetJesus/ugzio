const STATUS_META: Record<string, { bg: string; text: string; label: string }> = {
  CREATED: { bg: "bg-blue-500/15", text: "text-blue-500", label: "CREATED" },
  PRE_SHIPPING_CONFIRM_SENT: { bg: "bg-emerald-500/15", text: "text-emerald-500", label: "CONFIRM SENT" },
  BUYER_CONFIRMED: { bg: "bg-emerald-500/15", text: "text-emerald-500", label: "CONFIRMED ✓" },
  SHIPPED: { bg: "bg-cyan-500/15", text: "text-cyan-500", label: "SHIPPED" },
  DELIVERED: { bg: "bg-green-500/15", text: "text-green-500", label: "DELIVERED ✓" },
  UGC_REQUESTED: { bg: "bg-pink-500/15", text: "text-pink-500", label: "UGC REQUESTED" },
  UGC_RECEIVED: { bg: "bg-rose-500/15", text: "text-rose-500", label: "UGC RECEIVED" },
  INTELLIGENT_CANCEL: { bg: "bg-red-500/15", text: "text-red-500", label: "CANCELLED" },
  PENDING_RESCHEDULE: { bg: "bg-orange-500/15", text: "text-orange-500", label: "RESCHEDULE" },
  REFUSED: { bg: "bg-red-500/15", text: "text-red-500", label: "REFUSED" },
}

export default function OrderStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { bg: "bg-[var(--border)]", text: "text-[var(--text-secondary)]", label: status }
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  )
}

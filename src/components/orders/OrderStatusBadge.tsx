const STATUS_META: Record<string, { bg: string; text: string; label: string }> = {
  CREATED: { bg: "bg-blue-500/15", text: "text-blue-400", label: "CREATED" },
  PRE_SHIPPING_CONFIRM_SENT: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "CONFIRM SENT" },
  BUYER_CONFIRMED: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "CONFIRMED ✓" },
  SHIPPED: { bg: "bg-cyan-500/15", text: "text-cyan-400", label: "SHIPPED" },
  DELIVERED: { bg: "bg-green-500/15", text: "text-green-400", label: "DELIVERED ✓" },
  UGC_REQUESTED: { bg: "bg-pink-500/15", text: "text-pink-400", label: "UGC REQUESTED" },
  UGC_RECEIVED: { bg: "bg-rose-500/15", text: "text-rose-400", label: "UGC RECEIVED" },
  INTELLIGENT_CANCEL: { bg: "bg-red-500/15", text: "text-red-400", label: "CANCELLED" },
  PENDING_RESCHEDULE: { bg: "bg-orange-500/15", text: "text-orange-400", label: "RESCHEDULE" },
  REFUSED: { bg: "bg-red-500/15", text: "text-red-400", label: "REFUSED" },
}

export default function OrderStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { bg: "bg-zinc-800", text: "text-zinc-400", label: status }
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  )
}

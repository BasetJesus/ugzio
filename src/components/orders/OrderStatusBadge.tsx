const STATUS_META: Record<string, { bg: string; text: string; label: string }> = {
  CREATED: { bg: "bg-[var(--accent)]/15", text: "text-[var(--accent)]", label: "CREATED" },
  PRE_SHIPPING_CONFIRM_SENT: { bg: "bg-[var(--success-green)]/15", text: "text-[var(--success-green)]", label: "CONFIRM SENT" },
  BUYER_CONFIRMED: { bg: "bg-[var(--success-green)]/15", text: "text-[var(--success-green)]", label: "CONFIRMED ✓" },
  SHIPPED: { bg: "bg-[var(--accent)]/15", text: "text-[var(--accent)]", label: "SHIPPED" },
  DELIVERED: { bg: "bg-[var(--success-green)]/15", text: "text-[var(--success-green)]", label: "DELIVERED ✓" },
  UGC_REQUESTED: { bg: "bg-[var(--warning-amber)]/15", text: "text-[var(--warning-amber)]", label: "UGC REQUESTED" },
  UGC_RECEIVED: { bg: "bg-[var(--accent)]/15", text: "text-[var(--accent)]", label: "UGC RECEIVED" },
  INTELLIGENT_CANCEL: { bg: "bg-[var(--risk-red)]/15", text: "text-[var(--risk-red)]", label: "CANCELLED" },
  PENDING_RESCHEDULE: { bg: "bg-[var(--warning-amber)]/15", text: "text-[var(--warning-amber)]", label: "RESCHEDULE" },
  REFUSED: { bg: "bg-[var(--risk-red)]/15", text: "text-[var(--risk-red)]", label: "REFUSED" },
}

export default function OrderStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { bg: "bg-[var(--border)]", text: "text-[var(--text-secondary)]", label: status }
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  )
}

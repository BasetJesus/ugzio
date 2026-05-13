"use client"

import type { OperationEventRecord } from "@/services/operation-timeline.service"

interface Props {
  events: OperationEventRecord[]
  orderAmount?: number
}

const EVENT_LABELS: Record<string, string> = {
  sequence_selected: "Reassurance sequence sent",
  whatsapp_opened: "Buyer opened WhatsApp",
  whatsapp_message_sent: "WhatsApp message sent",
  message_sent: "WhatsApp message sent",
  buyer_replied: "Buyer replied",
  buyer_confirmed: "Buyer confirmed order",
  confirmed: "Order confirmed by operator",
  delayed_request: "Buyer requested delay",
  unreachable: "Buyer unreachable",
  cancelled: "Order cancelled",
  retry_scheduled: "Retry scheduled",
  operator_note: "Operator note added",
  ugc_request_sent: "UGC request triggered",
  ugc_received: "UGC received from buyer",
  delivery_completed: "Delivery completed",
  customer_story_shared: "Customer shared story",
  review_received: "Review received",
}

const DOT_STYLES: Record<string, string> = {
  confirmed: "border-[var(--success-green)] text-[var(--success-green)]",
  buyer_confirmed: "border-[var(--success-green)] text-[var(--success-green)]",
  buyer_replied: "border-[var(--accent)] text-[var(--accent)]",
  delivery_completed: "border-[var(--success-green)] text-[var(--success-green)]",
  ugc_received: "border-[var(--accent)] text-[var(--accent)]",
  review_received: "border-[var(--warning-amber)] text-[var(--warning-amber)]",
  customer_story_shared: "border-[var(--psych-reminder)] text-[var(--psych-reminder)]",
  whatsapp_opened: "border-[var(--accent)] text-[var(--accent)]",
  buyer_replied_12m: "border-[var(--success-green)] text-[var(--success-green)]",
}

const DOT_EMOTIONS: Record<string, string> = {
  confirmed: "bg-[var(--success-green)]",
  buyer_confirmed: "bg-[var(--success-green)]",
  buyer_replied: "bg-[var(--accent)]",
  delivery_completed: "bg-[var(--success-green)]",
  ugc_received: "bg-[var(--accent)]",
  review_received: "bg-[var(--warning-amber)]",
  customer_story_shared: "bg-[var(--psych-reminder)]",
  whatsapp_opened: "bg-[var(--accent)]",
  unreachable: "bg-[var(--risk-red)]",
  cancelled: "bg-[var(--risk-red)]",
  delayed_request: "bg-[var(--warning-amber)]",
  retry_scheduled: "bg-[var(--warning-amber)]",
  operator_note: "bg-[var(--text-tertiary)]",
  ugc_request_sent: "bg-[var(--psych-reassurance)]",
  message_sent: "bg-[var(--accent)]",
  whatsapp_message_sent: "bg-[var(--accent)]",
  sequence_selected: "bg-[var(--psych-trust)]",
}

function dotStyle(type: string): string {
  return DOT_STYLES[type] ?? "border-[var(--border)] text-[var(--text-tertiary)]"
}

function dotColor(type: string): string {
  return DOT_EMOTIONS[type] ?? "bg-[var(--border)]"
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const hours = d.getHours().toString().padStart(2, "0")
  const mins = d.getMinutes().toString().padStart(2, "0")
  const day = d.getDate().toString().padStart(2, "0")
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  return day + "/" + month + " " + hours + ":" + mins
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return mins + "m"
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + "h"
  return Math.floor(hours / 24) + "d"
}

function revenueLabel(event: OperationEventRecord, orderAmount?: number): string | null {
  if (event.type === "confirmed" && orderAmount) {
    return "Revenue protected: " + orderAmount.toFixed(0) + " TND"
  }
  if (event.type === "delivery_completed" && orderAmount) {
    return "Revenue secured: " + orderAmount.toFixed(0) + " TND"
  }
  if (event.metadata?.revenueProtected) {
    return "Revenue protected: " + Number(event.metadata.revenueProtected).toFixed(0) + " TND"
  }
  return null
}

export default function OrderTimeline({ events, orderAmount }: Props) {
  if (events.length === 0) return null

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-green)] animate-pulse-soft" />
          <p className="text-caption text-[var(--text-tertiary)]">Operation Timeline</p>
        </div>
      </div>

      <div className="p-panel">
        <div className="space-y-0">
          {events.map((event, i) => {
            const label = EVENT_LABELS[event.type] ?? event.type.replace(/_/g, " ")
            const revenue = revenueLabel(event, orderAmount)

            return (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={"h-2.5 w-2.5 rounded-full " + dotColor(event.type) + " ring-2 ring-[var(--bg-card)] mt-1.5"} />
                  {i < events.length - 1 && (
                    <div className="w-px flex-1 bg-[var(--border)]" />
                  )}
                </div>
                <div className={"pb-inline flex-1 min-w-0 " + (i === events.length - 1 ? "pb-0" : "")}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {label}
                    </p>
                    <span className="text-[9px] text-[var(--text-tertiary)] shrink-0">
                      {formatTimeAgo(event.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {event.actorType === "system" ? "System" : event.actorType === "operator" ? "Operator" : "Buyer"}
                    </span>
                    <span className="text-[9px] text-[var(--text-tertiary)]">
                      {formatTime(event.createdAt)}
                    </span>
                  </div>
                  {revenue && (
                    <p className="text-[10px] text-[var(--success-green)] font-medium mt-0.5">
                      {revenue}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import type { OperationEventRecord } from "@/services/operation-timeline.service"

interface Props {
  events: OperationEventRecord[]
}

const EVENT_LABELS: Record<string, string> = {
  message_sent: "sent a WhatsApp message",
  whatsapp_opened: "opened WhatsApp message",
  whatsapp_message_sent: "sent a WhatsApp message",
  buyer_replied: "replied to confirmation",
  buyer_confirmed: "confirmed the order",
  confirmed: "confirmed the order",
  unreachable: "marked as unreachable",
  delayed_request: "requested delay",
  cancelled: "cancelled the order",
  retry_scheduled: "scheduled retry",
  operator_note: "added an operator note",
  sequence_selected: "selected psychology sequence",
  ugc_request_sent: "UGC request sent",
  ugc_received: "UGC received",
  delivery_completed: "delivery completed",
  customer_story_shared: "customer shared story",
  review_received: "review received",
}

const EVENT_ICONS: Record<string, string> = {
  message_sent: "\uD83D\uDCE8",
  whatsapp_opened: "\uD83D\uDC41\uFE0F",
  whatsapp_message_sent: "\uD83D\uDCE8",
  buyer_replied: "\uD83D\uDCAC",
  buyer_confirmed: "\u2705",
  confirmed: "\u2705",
  unreachable: "\uD83D\uDCF5",
  delayed_request: "\u23F3",
  cancelled: "\uD83D\uDEAB",
  retry_scheduled: "\uD83D\uDD04",
  operator_note: "\uD83D\uDCDD",
  sequence_selected: "\uD83E\uDDE0",
  ugc_request_sent: "\uD83D\uDCF7",
  ugc_received: "\uD83D\uDCF8",
  delivery_completed: "\uD83D\uDE9A",
  customer_story_shared: "\uD83D\uDCAC",
  review_received: "\u2B50",
}

const EVENT_EMOTIONS: Record<string, string> = {
  message_sent: "var(--accent)",
  whatsapp_opened: "var(--accent)",
  whatsapp_message_sent: "var(--accent)",
  buyer_replied: "var(--success-green)",
  buyer_confirmed: "var(--success-green)",
  confirmed: "var(--success-green)",
  unreachable: "var(--risk-red)",
  delayed_request: "var(--warning-amber)",
  cancelled: "var(--risk-red)",
  retry_scheduled: "var(--warning-amber)",
  operator_note: "var(--text-tertiary)",
  sequence_selected: "var(--psych-trust)",
  ugc_request_sent: "var(--psych-reassurance)",
  ugc_received: "var(--accent)",
  delivery_completed: "var(--success-green)",
  customer_story_shared: "var(--psych-reminder)",
  review_received: "var(--warning-amber)",
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function OperationalFeed({ events }: Props) {
  const [visible, setVisible] = useState<OperationEventRecord[]>(events.slice(0, 5))
  const [animatingIn, setAnimatingIn] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setVisible(events.slice(0, 5))
  }, [events])

  useEffect(() => {
    if (events.length === 0) return
    intervalRef.current = setInterval(() => {
      setVisible((prev) => {
        const nextIdx = prev.length
        if (nextIdx >= events.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return prev
        }
        const next = events[nextIdx]
        setAnimatingIn(next.id)
        setTimeout(() => setAnimatingIn(null), 500)
        return [...prev, next]
      })
    }, 4000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [events])

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-panel">
        <p className="text-caption text-[var(--text-tertiary)] mb-3">Live Activity</p>
        <p className="text-xs text-[var(--text-secondary)]">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-green)] animate-pulse-soft" />
          <p className="text-caption text-[var(--text-tertiary)]">Live Activity</p>
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {visible.map((event) => {
          const label = EVENT_LABELS[event.type] ?? event.type
          const icon = EVENT_ICONS[event.type] ?? "\u2022"
          const color = EVENT_EMOTIONS[event.type] ?? "var(--text-tertiary)"
          const isNew = animatingIn === event.id

          return (
            <div
              key={event.id}
              className={`flex items-start gap-3 px-panel py-3 ${
                isNew ? "animate-fade-in" : ""
              }`}
            >
              <span className="text-sm mt-0.5 shrink-0">{icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--text-primary)]">
                  <span style={{ color }}>{event.actorType === "system" ? "System" : event.actorType === "operator" ? "Operator" : "Buyer"}</span>
                  {" "}{label}
                </p>
                {event.metadata?.orderAmount != null && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    {Number(event.metadata.orderAmount).toFixed(0)} TND
                  </p>
                )}
              </div>
              <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
                {timeAgo(event.createdAt)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

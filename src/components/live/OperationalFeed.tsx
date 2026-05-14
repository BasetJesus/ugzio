"use client"

import { useEffect, useState } from "react"
import type { OperationEventRecord } from "@/services/operation-timeline.service"
import { timeAgo, feedRhythmDelay } from "@/lib/utils"

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
  message_sent: "var(--state-calm)",
  whatsapp_opened: "var(--state-calm)",
  whatsapp_message_sent: "var(--state-calm)",
  buyer_replied: "var(--state-protected)",
  buyer_confirmed: "var(--state-protected)",
  confirmed: "var(--state-protected)",
  unreachable: "var(--state-urgent)",
  delayed_request: "var(--state-recovering)",
  cancelled: "var(--state-urgent)",
  retry_scheduled: "var(--state-recovering)",
  operator_note: "var(--text-tertiary)",
  sequence_selected: "var(--psych-trust)",
  ugc_request_sent: "var(--psych-reassurance)",
  ugc_received: "var(--state-calm)",
  delivery_completed: "var(--state-protected)",
  customer_story_shared: "var(--psych-reminder)",
  review_received: "var(--state-recovering)",
}

const ACTOR_LABELS: Record<string, string> = {
  system: "System",
  operator: "You",
  buyer: "Buyer",
}

const EVENT_STATES: Record<string, string> = {
  message_sent: "calm",
  whatsapp_opened: "calm",
  whatsapp_message_sent: "calm",
  buyer_replied: "protected",
  buyer_confirmed: "protected",
  confirmed: "protected",
  unreachable: "urgent",
  delayed_request: "recovering",
  cancelled: "urgent",
  retry_scheduled: "recovering",
  operator_note: "stable",
  sequence_selected: "focused",
  ugc_request_sent: "focused",
  ugc_received: "calm",
  delivery_completed: "protected",
  customer_story_shared: "calm",
  review_received: "recovering",
}

export default function OperationalFeed({ events }: Props) {
  const [visible, setVisible] = useState<OperationEventRecord[]>([])
  const [animatingIn, setAnimatingIn] = useState<string | null>(null)

  useEffect(() => {
    setVisible(events.slice(0, 5))
  }, [events])

  useEffect(() => {
    if (events.length === 0) return
    let idx = 5
    let timer: ReturnType<typeof setTimeout> | null = null

    function scheduleNext() {
      if (idx >= events.length) return
      const delay = feedRhythmDelay(idx)
      timer = setTimeout(() => {
        const next = events[idx]
        idx++
        setAnimatingIn(next.id)
        setVisible((prev) => [...prev, next])
        setTimeout(() => setAnimatingIn(null), 600)
        scheduleNext()
      }, delay)
    }

    scheduleNext()
    return () => { if (timer) clearTimeout(timer) }
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
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--state-calm)] animate-pulse-calm" />
          <p className="text-caption text-[var(--text-tertiary)]">Live Activity</p>
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {visible.map((event) => {
          const label = EVENT_LABELS[event.type] ?? event.type
          const icon = EVENT_ICONS[event.type] ?? "\u2022"
          const color = EVENT_EMOTIONS[event.type] ?? "var(--text-tertiary)"
          const isNew = animatingIn === event.id
          const actor = ACTOR_LABELS[event.actorType] ?? event.actorType
          const microState = EVENT_STATES[event.type] ?? "stable"

          return (
            <div
              key={event.id}
              className={`flex items-start gap-3 px-panel py-3 transition-all duration-500 ${
                isNew ? "animate-emotion-transition" : ""
              }`}
            >
              <span className="text-sm mt-0.5 shrink-0">{icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--text-primary)]">
                  <span style={{ color }} className="font-medium">{actor}</span>
                  {" "}{label}
                </p>
                {event.metadata?.orderAmount != null && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    {Number(event.metadata.orderAmount).toFixed(0)} TND
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="h-1 w-1 rounded-full presence-dot"
                  style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}40` }}
                />
                <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider">
                  {microState}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {timeAgo(event.createdAt)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import type { JourneyEventRecord, BehaviorTag } from "@/types/journey"
import { BEHAVIOR_TAG_LABELS } from "@/types/journey"

interface Props {
  events: JourneyEventRecord[]
  behaviorTags: BehaviorTag[]
}

const TAG_STYLES: Record<BehaviorTag, string> = {
  responsive: "bg-[var(--success-green-bg)] text-[var(--success-green)] border-[var(--success-green-border)]",
  hesitant: "bg-[var(--warning-amber-bg)] text-[var(--warning-amber)] border-[var(--warning-amber-border)]",
  ghosting: "bg-[var(--kpi-red-bg)] text-[var(--risk-red)] border-[var(--kpi-red-border)]",
  engaged: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
  "high-friction": "bg-[var(--warning-amber-bg)] text-[var(--warning-amber)] border-[var(--warning-amber-border)]",
}

const DOT_COLORS: Record<string, string> = {
  BUYER_CONFIRMED: "bg-[var(--success-green)]",
  ORDER_DELIVERED: "bg-[var(--success-green)]",
  DELIVERY_SUCCESS: "bg-[var(--success-green)]",
  BUYER_RESPONDED: "bg-[var(--accent)]",
  BUYER_CONTACT_ATTEMPTED: "bg-[var(--border)]",
  BUYER_EXPRESSED_HESITATION: "bg-[var(--warning-amber)]",
  BUYER_STOPPED_RESPONDING: "bg-[var(--risk-red)]",
  BUYER_REFUSED: "bg-[var(--risk-red)]",
  ORDER_CANCELLED: "bg-[var(--risk-red)]",
  UGC_REQUEST_SENT: "bg-[var(--psych-reassurance)]",
  UGC_RECEIVED: "bg-[var(--accent)]",
  CUSTOMER_STORY_SHARED: "bg-[var(--psych-reminder)]",
  REVIEW_RECEIVED: "bg-[var(--warning-amber)]",
}

function dotColor(eventType: string): string {
  return DOT_COLORS[eventType] ?? "bg-[var(--border)]"
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const hours = d.getHours().toString().padStart(2, "0")
  const mins = d.getMinutes().toString().padStart(2, "0")
  const day = d.getDate().toString().padStart(2, "0")
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  return day + "/" + month + " " + hours + ":" + mins
}

function metadataSummary(md: Record<string, unknown> | null): string | null {
  if (!md) return null
  if (md.method) return "via " + (md.method as string).replace("_", " ")
  if (md.channel) return "via " + (md.channel as string)
  if (md.operator) return "by " + (md.operator as string)
  if (md.outcome) return md.outcome as string
  return null
}

export default function JourneyTimeline({ events, behaviorTags }: Props) {
  if (events.length === 0) return null

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-card">
      <p className="text-caption text-[var(--text-tertiary)] mb-4">
        Buyer Journey
      </p>

      {behaviorTags.length > 0 && (
        <div className="flex flex-wrap gap-tight mb-4">
          {behaviorTags.map((tag) => (
            <span
              key={tag}
              className={
                "text-[9px] font-medium px-1.5 py-0.5 rounded-full border " +
                TAG_STYLES[tag]
              }
            >
              {BEHAVIOR_TAG_LABELS[tag]}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-0">
        {events.map((event, i) => (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`h-2 w-2 rounded-full ${dotColor(event.eventType)} mt-1.5`} />
              {i < events.length - 1 && (
                <div className="w-px flex-1 bg-[var(--border)]" />
              )}
            </div>
            <div className="pb-inline flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                  {event.label}
                </p>
                <span className="text-[9px] text-[var(--text-tertiary)] shrink-0">
                  {formatTime(event.occurredAt)}
                </span>
              </div>
              {event.metadata && (
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                  {metadataSummary(event.metadata)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

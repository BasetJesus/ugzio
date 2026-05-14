"use client"

import { useState, useCallback } from "react"
import type { ConfirmationQueueItem } from "@/services/confirmation.service"
import type { PsychologyPreview } from "@/types/whatsapp"
import StatePulse from "@/components/shared/StatePulse"
import VoiceNoteRecorder from "@/components/confirm/VoiceNoteRecorder"

interface Props {
  item: ConfirmationQueueItem
  psychology?: PsychologyPreview
  onAction: (orderId: string, action: string) => void
  onSelect?: () => void
  submitting?: string | null
}

function failurePct(item: ConfirmationQueueItem): number {
  if (item.riskLevel === "high") return 65 + Math.round((100 - item.trustScore) * 0.35)
  if (item.riskLevel === "medium") return 35 + Math.round((100 - item.trustScore) * 0.25)
  return Math.round((100 - item.trustScore) * 0.15)
}

function avatarColor(name: string): string {
  const colors = ["bg-emerald-600", "bg-purple-600", "bg-amber-600", "bg-blue-600", "bg-pink-600", "bg-cyan-600"]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function initials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

function timeSince(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return d.toLocaleDateString("fr-TN", { day: "numeric", month: "short" })
}

const PSYCH_PULSE: Record<string, "calm" | "focused" | "urgent" | "protected"> = {
  trust: "calm",
  reminder: "focused",
  urgency: "urgent",
  reassurance: "protected",
}

export default function WhatsAppDecisionCard({ item, psychology, onAction, onSelect, submitting }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const pct = failurePct(item)
  const sub = submitting
  const pulseState = PSYCH_PULSE[psychology?.sequenceType ?? "trust"] ?? "calm"

  const handleAction = useCallback((e: React.MouseEvent, action: string) => {
    e.stopPropagation()
    setConfirming(true)
    onAction(item.orderId, action)
    setTimeout(() => setConfirming(false), 1500)
  }, [onAction, item.orderId])

  const handleVoiceSend = useCallback((_blob: Blob) => {
    setShowVoice(false)
    onAction(item.orderId, "confirm")
  }, [onAction, item.orderId])

  const handleSelect = useCallback(() => {
    if (onSelect) onSelect()
  }, [onSelect])

  const barColor = item.riskLevel === "high" ? "bg-red-500" : item.riskLevel === "medium" ? "bg-amber-500" : "bg-emerald-500"
  const barWidth = item.riskLevel === "high" ? "w-1" : "w-0.5"

  return (
    <div
      className="rounded-xl border border-white/[0.06] bg-zinc-900/50 overflow-hidden transition-all duration-200 active:scale-[0.99] touch-manipulation hover:border-white/[0.1]"
      onClick={handleSelect}
    >
      <div className="flex">
        <div className={`${barWidth} shrink-0 ${barColor} opacity-60`} />

        <div className="flex-1 min-w-0 p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <div className={`shrink-0 w-10 h-10 rounded-full ${avatarColor(item.buyerName)} flex items-center justify-center`}>
              <span className="text-xs font-bold text-white">{initials(item.buyerName)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.buyerName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                      item.riskLevel === "high" ? "text-red-400 border-red-500/20 bg-red-500/10" :
                      item.riskLevel === "medium" ? "text-amber-400 border-amber-500/20 bg-amber-500/10" :
                      "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                    }`}>
                      {item.riskLevel}
                    </span>
                    {item.lastAttemptAt && (
                      <span className="text-[10px] text-white/30">{timeSince(item.lastAttemptAt)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-white">{item.amount.toFixed(0)}</p>
                  <p className="text-[9px] text-white/40 -mt-0.5">TND</p>
                </div>
              </div>

              <div className="mt-2 rounded-xl bg-[#1a2e2a] border border-green-900/30 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <StatePulse state={pulseState} size="sm" />
                  <span className="text-[9px] font-medium text-green-400/70">UGZIO Bot</span>
                  {psychology && (
                    <span className="text-[8px] text-green-600 ml-auto">
                      {psychology.sequenceType} sequence
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-green-200/70 leading-relaxed line-clamp-2">
                  {psychology?.previewMessage ?? "No preview available"}
                </p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <svg className="h-2.5 w-2.5 text-green-400/60" viewBox="0 0 16 11" fill="currentColor">
                    <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.337.153.504.504 0 0 0 0 .695l2.375 2.475a.46.46 0 0 0 .332.153.46.46 0 0 0 .332-.153l6.52-8.044a.504.504 0 0 0 0-.695.457.457 0 0 0-.013-.046-.517.517 0 0 0-.037-.098Z" />
                    <path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.136-1.184a.048.048 0 0 0-.018.019l-.386.476.634.66a.46.46 0 0 0 .332.153.46.46 0 0 0 .332-.153l6.52-8.044a.504.504 0 0 0 0-.695.457.457 0 0 0-.013-.046.517.517 0 0 0-.037-.098Z" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct > 60 ? "bg-red-500" : pct > 30 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`text-[10px] font-semibold shrink-0 ${
                  pct > 60 ? "text-red-400" : pct > 30 ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {pct}% failure
                </span>
              </div>
            </div>
          </div>

          {showVoice && (
            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
              <VoiceNoteRecorder
                buyerName={item.buyerName}
                orderAmount={item.amount}
                onSend={handleVoiceSend}
                onClose={() => setShowVoice(false)}
              />
            </div>
          )}

          <div className={`grid grid-cols-4 gap-1.5 mt-3 ${confirming ? "animate-pulse" : ""}`}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowVoice(v => !v); }}
              className={`rounded-lg py-2.5 text-xs font-semibold transition-all active:scale-[0.97] touch-manipulation ${showVoice ? "bg-emerald-600 text-white" : "border border-white/15 text-white/50 hover:text-white hover:border-white/30"}`}
            >
              🎤
            </button>
            <button
              onClick={(e) => handleAction(e, "confirm")}
              disabled={sub === `${item.orderId}_confirm`}
              className="rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-all active:scale-[0.97] touch-manipulation"
            >
              {sub === `${item.orderId}_confirm` ? "..." : "Secure"}
            </button>
            <button
              onClick={(e) => handleAction(e, "retry")}
              disabled={sub === `${item.orderId}_retry`}
              className="rounded-lg border border-amber-500/30 py-2.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 disabled:opacity-60 transition-all active:scale-[0.97] touch-manipulation"
            >
              {sub === `${item.orderId}_retry` ? "..." : "Retry"}
            </button>
            <button
              onClick={(e) => handleAction(e, "cancel")}
              disabled={sub === `${item.orderId}_cancel`}
              className="rounded-lg border border-red-500/30 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-60 transition-all active:scale-[0.97] touch-manipulation"
            >
              {sub === `${item.orderId}_cancel` ? "..." : "Prevent"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

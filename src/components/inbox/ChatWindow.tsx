"use client"

import { useState } from "react"
import TrustScoreBar from "@/components/dashboard/TrustScoreBar"
import RiskBadge from "@/components/dashboard/RiskBadge"
import InternalNote from "./InternalNote"
import ActivityTimeline from "./ActivityTimeline"

interface Order {
  id: string
  buyerName: string
  buyerPhone: string
  amount: number
  trustScore: number
  riskLevel: string
  status: string
}

interface Message {
  id: string
  direction: string
  content: string
  channel: string
  status: string
  createdAt: Date
}

interface Note {
  id: string
  content: string
  authorId: string
  createdAt: Date
}

interface ConvDetail {
  id: string
  buyerName: string
  buyerPhone: string
  order: Order | null
  messages: Message[]
  notes: Note[]
  createdAt: Date
}

const ORDER_EVENTS = [
  { status: "CREATED", label: "Commande créée" },
  { status: "PRE_SHIPPING_CONFIRM_SENT", label: "Vérification envoyée" },
  { status: "BUYER_CONFIRMED", label: "Client a confirmé" },
  { status: "SHIPPED", label: "Expédiée" },
  { status: "DELIVERED", label: "Livrée" },
]

export default function ChatWindow({ conversation }: { conversation: ConvDetail | null }) {
  const [noteText, setNoteText] = useState("")

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-600">Select a conversation</p>
      </div>
    )
  }

  async function addNote() {
    if (!noteText.trim() || !conversation) return
    await fetch(`/api/v1/conversations/${conversation.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteText }),
    })
    setNoteText("")
  }

  const activeEvents = ORDER_EVENTS.filter((e) => {
    if (!conversation.order) return false
    const order = conversation.order
    const orderIdx = ORDER_EVENTS.findIndex((o) => o.status === order.status)
    const eventIdx = ORDER_EVENTS.findIndex((o) => o.status === e.status)
    return eventIdx <= orderIdx
  })

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-zinc-200">{conversation.buyerName}</h2>
            <p className="text-xs text-zinc-500">{conversation.buyerPhone}</p>
          </div>
          {conversation.order && (
            <div className="shrink-0 text-right">
              <p className="font-medium text-emerald-300">{Number(conversation.order.amount).toFixed(3)} TND</p>
              <div className="mt-1">
                <RiskBadge risk={conversation.order.riskLevel as "low" | "medium" | "high"} />
              </div>
              <div className="mt-2 w-24">
                <TrustScoreBar score={conversation.order.trustScore} size="sm" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {conversation.messages.length === 0 && (
          <p className="text-center text-sm text-zinc-600">No messages yet</p>
        )}
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${
                msg.direction === "outbound"
                  ? "bg-emerald-500/20 text-zinc-200"
                  : msg.channel === "system"
                    ? "bg-zinc-800/30 text-zinc-500 italic"
                    : "bg-zinc-800 text-zinc-200"
              }`}
            >
              <p>{msg.content}</p>
              <p className="mt-1 text-[10px] text-zinc-600">{new Date(msg.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-800 p-4">
        <InternalNote
          notes={conversation.notes}
          noteText={noteText}
          onNoteChange={setNoteText}
          onAddNote={addNote}
        />
      </div>

      {conversation.order && (
        <div className="border-t border-zinc-800 p-4">
          <ActivityTimeline events={activeEvents} />
        </div>
      )}
    </div>
  )
}

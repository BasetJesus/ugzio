"use client";

import { useState, useCallback } from "react";
import { Search, ArrowLeft, Send, MessageSquare, ShieldAlert } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "buyer" | "seller";
  timestamp: string;
}

interface Thread {
  id: string;
  buyerName: string;
  orderId: string;
  amount: number;
  lastMessage: string;
  time: string;
  unread: number;
  status: string;
  risk: "safe" | "high";
  messages: Message[];
}

interface ConversationData {
  id: string;
  buyerName: string;
  buyerPhone: string;
  orderId: string | null;
  order: { trustScore: number; status: string } | null;
  messages: { id: string; direction: string; content: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  BUYER_CONFIRMED: { label: "CONFIRMED", color: "text-[var(--status-success)]", bg: "bg-[var(--status-success-bg)]" },
  SHIPPED: { label: "SHIPPED", color: "text-[var(--status-info)]", bg: "bg-[var(--status-info-bg)]" },
  DELIVERED: { label: "DELIVERED", color: "text-[var(--status-success)]", bg: "bg-[var(--status-success-bg)]" },
  CREATED: { label: "PENDING", color: "text-[var(--status-warning)]", bg: "bg-[var(--status-warning-bg)]" },
  PRE_SHIPPING_CONFIRM_SENT: { label: "AWAITING", color: "text-[var(--status-warning)]", bg: "bg-[var(--status-warning-bg)]" },
  UGC_REQUESTED: { label: "UGC ASKED", color: "text-[var(--status-info)]", bg: "bg-[var(--status-info-bg)]" },
  UGC_RECEIVED: { label: "UGC DONE", color: "text-[var(--status-success)]", bg: "bg-[var(--status-success-bg)]" },
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}j`;
  return d.toLocaleDateString("fr-TN", { day: "numeric", month: "short" });
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" });
}

function ConversationView({ thread, onBack }: { thread: Thread; onBack: () => void }) {
  const [reply, setReply] = useState("");

  const handleSend = () => {
    if (!reply.trim()) return;
    setReply("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-1 py-3">
        <button onClick={onBack} className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-[var(--text-secondary)]" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-[var(--text-primary)]">{getInitials(thread.buyerName)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--text-primary)] font-space">{thread.buyerName}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] font-inter">{thread.orderId}</p>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${(statusConfig[thread.status] || statusConfig["CREATED"]).bg} ${(statusConfig[thread.status] || statusConfig["CREATED"]).color} font-space`}>
            {(statusConfig[thread.status] || statusConfig["CREATED"]).label}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {thread.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-8 w-8 text-[var(--text-muted)] mb-2" />
            <p className="text-xs text-[var(--text-muted)] font-inter">No messages yet</p>
          </div>
        ) : (
          thread.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "seller" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.sender === "seller" ? "bg-[var(--accent)] text-[var(--bg-base)]" : "bg-[var(--bg-surface)] text-[var(--text-primary)]"}`}>
                <p className="text-xs leading-relaxed">{msg.text}</p>
                <p className={`text-[9px] mt-1 text-right ${msg.sender === "seller" ? "text-[var(--bg-base)]/50" : "text-[var(--text-muted)]"}`}>{msg.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full h-11 px-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50 transition-colors"
          />
          <button onClick={handleSend} className="h-11 w-11 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0 active:scale-90 transition-transform">
            <Send className="h-4 w-4 text-[var(--bg-base)]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function conversationToThread(c: ConversationData): Thread {
  const lastMsg = c.messages[c.messages.length - 1];
  const hasNew = c.messages.some((m) => m.direction === "inbound" && new Date(m.createdAt) > new Date(Date.now() - 86400000));
  return {
    id: c.id,
    buyerName: c.buyerName,
    orderId: c.orderId ? `#${c.orderId.slice(-6)}` : "",
    amount: 0,
    lastMessage: lastMsg?.content ?? "",
    time: formatTime(c.updatedAt),
    unread: hasNew ? c.messages.filter((m) => m.direction === "inbound").length : 0,
    status: c.order?.status ?? "CREATED",
    risk: (c.order?.trustScore ?? 50) < 40 ? "high" : "safe",
    messages: c.messages.map((m) => ({
      id: m.id,
      text: m.content,
      sender: m.direction === "outbound" ? "seller" : "buyer",
      timestamp: formatTimestamp(m.createdAt),
    })),
  };
}

interface Props {
  initialConversations: ConversationData[];
}

export default function ZioInboxClient({ initialConversations }: Props) {
  const [search, setSearch] = useState("");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [conversations] = useState(initialConversations);

  const threads = conversations.map(conversationToThread);

  const filtered = threads.filter(
    (t) =>
      t.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      t.orderId.includes(search)
  );

  const handleSelectThread = useCallback(async (thread: Thread) => {
    setSelectedThread(thread);
    try {
      const res = await fetch(`/api/v1/conversations/${thread.id}`);
      if (res.ok) {
        const data: ConversationData = await res.json();
        setSelectedThread(conversationToThread(data));
      }
    } catch {
    }
  }, []);

  if (selectedThread) {
    return (
      <div className="flex flex-col h-[calc(100dvh-8rem)]">
        <ConversationView thread={selectedThread} onBack={() => setSelectedThread(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl h-11 pl-10 pr-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50 transition-colors font-inter"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 -mx-4 px-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-10 w-10 text-[var(--text-muted)] mb-3" />
            <p className="text-sm text-[var(--text-muted)] font-inter">No conversations found</p>
          </div>
        ) : (
          filtered.map((thread) => {
            const cfg = statusConfig[thread.status] || statusConfig["CREATED"];
            return (
              <button
                key={thread.id}
                onClick={() => handleSelectThread(thread)}
                className="w-full text-left rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 active:scale-[0.99] transition-transform hover:bg-[var(--bg-elevated)]"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div className="h-11 w-11 rounded-full bg-[var(--bg-surface)] flex items-center justify-center">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{getInitials(thread.buyerName)}</span>
                    </div>
                    {thread.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[var(--status-danger)] text-[8px] font-bold text-white flex items-center justify-center">
                        {thread.unread}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold text-[var(--text-primary)] font-space truncate">{thread.buyerName}</span>
                        {thread.risk === "high" && (
                          <ShieldAlert className="h-3 w-3 text-[var(--status-danger)] shrink-0" />
                        )}
                      </div>
                      <span className="text-[9px] text-[var(--text-muted)] font-inter shrink-0">{thread.time}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{thread.orderId}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-[11px] text-[var(--text-secondary)] font-inter truncate flex-1">
                        {thread.lastMessage || "No messages yet"}
                      </p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-space shrink-0`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

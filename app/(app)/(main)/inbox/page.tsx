"use client";

import { useState } from "react";
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
  route: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: "confirmed" | "shipped" | "delivered" | "attention";
  risk: "safe" | "high";
  messages: Message[];
}

const mockThreads: Thread[] = [
  {
    id: "t1",
    buyerName: "Fatma B.",
    orderId: "#4101",
    amount: 129,
    route: "Tunis",
    lastMessage: "Yes, I confirm the order. Please proceed with delivery.",
    time: "2m",
    unread: 2,
    status: "confirmed",
    risk: "safe",
    messages: [
      { id: "m1", text: "Bonjour, I would like to confirm my order.", sender: "buyer", timestamp: "10:32" },
      { id: "m2", text: "Of course Fatma! Your order #4101 for 129 TND is ready.", sender: "seller", timestamp: "10:33" },
      { id: "m3", text: "Yes, I confirm the order. Please proceed with delivery.", sender: "buyer", timestamp: "10:35" },
    ],
  },
  {
    id: "t2",
    buyerName: "Amine K.",
    orderId: "#4102",
    amount: 245,
    route: "Sfax",
    lastMessage: "I'll pay on delivery as always",
    time: "15m",
    unread: 3,
    status: "attention",
    risk: "high",
    messages: [
      { id: "m4", text: "Hey, when will my order arrive?", sender: "buyer", timestamp: "09:15" },
      { id: "m5", text: "We can ship today after confirmation. This order requires 30% prepayment due to high risk.", sender: "seller", timestamp: "09:20" },
      { id: "m6", text: "I'll pay on delivery as always", sender: "buyer", timestamp: "09:22" },
      { id: "m7", text: "I never pay before receiving.", sender: "buyer", timestamp: "09:23" },
    ],
  },
  {
    id: "t3",
    buyerName: "Yasmine M.",
    orderId: "#4098",
    amount: 89,
    route: "Sousse",
    lastMessage: "Received the package! Thank you so much ✨",
    time: "2h",
    unread: 0,
    status: "delivered",
    risk: "safe",
    messages: [
      { id: "m8", text: "Is this still available?", sender: "buyer", timestamp: "Hier 14:00" },
      { id: "m9", text: "Yes, we have stock in all sizes!", sender: "seller", timestamp: "Hier 14:05" },
      { id: "m10", text: "Great, I'll take one", sender: "buyer", timestamp: "Hier 14:10" },
      { id: "m11", text: "Received the package! Thank you so much ✨", sender: "buyer", timestamp: "Hier 18:30" },
    ],
  },
  {
    id: "t4",
    buyerName: "Mohamed A.",
    orderId: "#4095",
    amount: 320,
    route: "Bizerte",
    lastMessage: "Can you deliver before Friday?",
    time: "4h",
    unread: 1,
    status: "shipped",
    risk: "safe",
    messages: [
      { id: "m12", text: "Can you deliver before Friday?", sender: "buyer", timestamp: "11:00" },
    ],
  },
  {
    id: "t5",
    buyerName: "Nour D.",
    orderId: "#4089",
    amount: 55,
    route: "Nabeul",
    lastMessage: "Changed my mind, cancel please",
    time: "1j",
    unread: 0,
    status: "attention",
    risk: "high",
    messages: [
      { id: "m13", text: "Changed my mind, cancel please", sender: "buyer", timestamp: "Hier 09:00" },
      { id: "m14", text: "Cancellation noted. We will process the refund.", sender: "seller", timestamp: "Hier 09:05" },
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: "CONFIRMED", color: "text-[var(--status-success)]", bg: "bg-[var(--status-success-bg)]" },
  shipped: { label: "SHIPPED", color: "text-[var(--status-info)]", bg: "bg-[var(--status-info-bg)]" },
  delivered: { label: "DELIVERED", color: "text-[var(--status-success)]", bg: "bg-[var(--status-success-bg)]" },
  attention: { label: "ATTENTION", color: "text-[var(--status-danger)]", bg: "bg-[var(--status-danger-bg)]" },
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
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
            <p className="text-[10px] text-[var(--text-tertiary)] font-inter">{thread.orderId} · {thread.route}</p>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusConfig[thread.status].bg} ${statusConfig[thread.status].color} font-space`}>
            {statusConfig[thread.status].label}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {thread.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "seller" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.sender === "seller" ? "bg-[var(--accent)] text-[var(--bg-base)]" : "bg-[var(--bg-surface)] text-[var(--text-primary)]"}`}>
              <p className="text-xs leading-relaxed">{msg.text}</p>
              <p className={`text-[9px] mt-1 text-right ${msg.sender === "seller" ? "text-[var(--bg-base)]/50" : "text-[var(--text-muted)]"}`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
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

export default function ZioInbox() {
  const [search, setSearch] = useState("");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  const filtered = mockThreads.filter(
    (t) =>
      t.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      t.orderId.includes(search)
  );

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
        <div>
          <h1 className="font-space text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Zio<span className="text-[var(--accent)]">Inbox</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-inter mt-1">
            Unified seller communication center — all your buyer conversations in one place.
          </p>
        </div>

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
            const cfg = statusConfig[thread.status];
            return (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
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
                      <span className="text-[10px] text-[var(--text-muted)]">·</span>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-inter">{thread.amount} TND</span>
                      <span className="text-[10px] text-[var(--text-muted)]">·</span>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-inter">{thread.route}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-[11px] text-[var(--text-secondary)] font-inter truncate flex-1">
                        {thread.lastMessage}
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

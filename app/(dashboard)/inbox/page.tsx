"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ConversationList from "@/components/inbox/ConversationList";
import ChatWindow from "@/components/inbox/ChatWindow";
import SearchBar from "@/components/shared/SearchBar";

interface Conv {
  id: string
  buyerName: string
  buyerPhone: string
  order: { trustScore: number; status: string } | null
  messages: { createdAt: string }[]
  updatedAt: string
}

interface ConvDetail {
  id: string
  buyerName: string
  buyerPhone: string
  order: {
    id: string
    buyerName: string
    buyerPhone: string
    amount: number
    trustScore: number
    riskLevel: string
    status: string
  } | null
  messages: {
    id: string
    direction: string
    content: string
    channel: string
    status: string
    createdAt: string
  }[]
  notes: {
    id: string
    content: string
    authorId: string
    createdAt: string
  }[]
  createdAt: string
}

export default function InboxPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [detail, setDetail] = useState<ConvDetail | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/v1/conversations").then((r) => r.json()).then(setConversations);
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setSelectedId(id);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/v1/conversations/${selectedId}`).then((r) => r.json()).then(setDetail);
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      c.buyerName.toLowerCase().includes(q) || c.buyerPhone.includes(q)
    );
  }, [conversations, search]);

  function handleSelect(id: string) {
    setSelectedId(id);
    window.history.replaceState(null, "", `/inbox?id=${id}`);
  }

  return (
    <div className="h-[calc(100dvh-3rem)] grid grid-cols-1 md:grid-cols-12 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="md:col-span-4 border-r border-zinc-800 overflow-y-auto bg-zinc-950/50">
        <div className="p-3 border-b border-zinc-800 space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-[10px]">📸</span>
            <h2 className="font-semibold text-zinc-200">Collect — Inbox</h2>
            <span className="ml-auto text-xs text-zinc-500">{filtered.length}</span>
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search conversations..." />
        </div>
        <ConversationList
          conversations={filtered.map((c) => ({
            ...c,
            messages: c.messages.map((m) => ({ createdAt: new Date(m.createdAt) })),
            updatedAt: new Date(c.updatedAt),
          }))}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>
      <div className="md:col-span-8 overflow-y-auto bg-zinc-950/30">
        <ChatWindow
          conversation={detail ? {
            ...detail,
            createdAt: new Date(detail.createdAt),
            messages: detail.messages.map((m) => ({ ...m, createdAt: new Date(m.createdAt) })),
            notes: detail.notes.map((n) => ({ ...n, createdAt: new Date(n.createdAt) })),
            order: detail.order ? {
              ...detail.order,
              amount: Number(detail.order.amount),
            } : null,
          } : null}
        />
      </div>
    </div>
  );
}

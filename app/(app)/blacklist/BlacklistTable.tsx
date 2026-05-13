"use client"

import { useRouter } from "next/navigation"

interface Buyer {
  buyerPhone: string
  buyerName: string
  createdAt: string
}

export default function BlacklistTable({ items, orgId }: { items: Buyer[]; orgId: string }) {
  const router = useRouter()

  async function handleRemove(phone: string) {
    await fetch("/api/v1/zioshield/blacklist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, phone }),
    })
    router.refresh()
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="text-4xl">🛡️</span>
        <h3 className="mt-4 text-lg font-semibold text-zinc-300">No blacklisted buyers</h3>
        <p className="mt-1 text-sm text-zinc-500">When you blacklist a buyer, they&apos;ll appear here.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-800/40">
      {items.map((buyer) => (
        <div
          key={buyer.buyerPhone}
          className="flex items-center justify-between px-1 py-3"
        >
          <div>
            <p className="font-medium text-zinc-200">{buyer.buyerName || "Unknown"}</p>
            <p className="text-xs text-zinc-500">{buyer.buyerPhone}</p>
            <p className="text-[10px] text-zinc-600">{new Date(buyer.createdAt).toLocaleDateString()}</p>
          </div>
          <button
            onClick={() => handleRemove(buyer.buyerPhone)}
            className="rounded-md border border-zinc-800/50 bg-zinc-900/30 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800/50"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}

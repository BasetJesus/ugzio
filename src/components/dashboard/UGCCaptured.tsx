"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

/* ── Types ── */

export interface UGCItem {
  id: string
  imageUrl: string
  isNew: boolean
  creator: string
  platform: string
  uploadedAt: string
}

/* ── Component ── */

interface UGCCapturedProps {
  items?: UGCItem[]
  href?: string
}

export default function UGCCaptured({ items = [], href = "/capture" }: UGCCapturedProps) {
  const card = (
    <div
      className="rounded-xl border p-5 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-white">📷 UGC Captured</h3>
        <span className="text-[12px] font-medium" style={{ color: "#FFD700" }}>
          View all &rsaquo;
        </span>
      </div>

      {/* ── Scrollable grid ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {items.length === 0 && (
          <div className="flex items-center justify-center w-full py-6">
            <span className="text-[13px]" style={{ color: "#6B7280" }}>No UGC captured yet</span>
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative shrink-0 rounded-lg overflow-hidden transition-all duration-200"
            style={{ width: 100, height: 120 }}
          >
            <img
              src={item.imageUrl}
              alt={`UGC by ${item.creator}`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
            {item.isNew && (
              <span
                className="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold leading-none"
                style={{ backgroundColor: "#FFD700", color: "#0B0D12" }}
              >
                New
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return <Link href={href} className="block">{card}</Link>
}

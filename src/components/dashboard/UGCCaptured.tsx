"use client"

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

/* ── Mock data ── */

const MOCK_ITEMS: UGCItem[] = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=200&h=240&fit=crop",
    isNew: true,
    creator: "@ines.style",
    platform: "Instagram",
    uploadedAt: "2h ago",
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=240&fit=crop",
    isNew: false,
    creator: "@mariem_b",
    platform: "TikTok",
    uploadedAt: "1d ago",
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=240&fit=crop",
    isNew: false,
    creator: "@youssef_m",
    platform: "Instagram",
    uploadedAt: "2d ago",
  },
  {
    id: "4",
    imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200&h=240&fit=crop",
    isNew: false,
    creator: "@nad.ia_f",
    platform: "Facebook",
    uploadedAt: "3d ago",
  },
]

/* ── Component ── */

interface UGCCapturedProps {
  items?: UGCItem[]
}

export default function UGCCaptured({ items = MOCK_ITEMS }: UGCCapturedProps) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-white">📷 UGC Captured</h3>
        <button className="text-[12px] font-medium transition-opacity hover:opacity-80" style={{ color: "#FFD700" }}>
          View all &rsaquo;
        </button>
      </div>

      {/* ── Scrollable grid ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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
            <div
              className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
              style={{ boxShadow: "inset 0 0 0 2px #FFD700" }}
            />
          </div>
        ))}

        {/* ── Add more button ── */}
        <button
          className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-1.5 border-dashed transition-colors hover:border-[#FFD700]/40"
          style={{
            width: 100,
            height: 120,
            backgroundColor: "#2A303C",
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <Plus size={24} color="#FFD700" />
          <span className="text-[11px]" style={{ color: "#6B7280" }}>Add more</span>
        </button>
      </div>
    </div>
  )
}

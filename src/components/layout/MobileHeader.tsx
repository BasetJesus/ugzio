"use client"

import { Menu } from "lucide-react"
import Link from "next/link"

export default function MobileHeader() {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 md:hidden"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <Link href="/overview" className="text-[16px] font-bold text-white">
        UGZIO
      </Link>
      <button
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#2A303C] transition-colors"
        style={{ color: "#9CA3AF" }}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function NotificationBell({ orgId }: { orgId: string }) {
  const [count, setCount] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/v1/zioshield/risk?orgId=${orgId}`)
        const data = await res.json()
        setCount(data.highRiskCount ?? 0)
      } catch {
        // silent
      }
    }
    poll()
    const interval = setInterval(poll, 30000)
    return () => clearInterval(interval)
  }, [orgId])

  if (count === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="relative rounded-lg px-2 py-1 text-sm text-zinc-400 hover:text-zinc-200"
      >
        🔔
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      </button>
      {show && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-3 shadow-xl z-50">
          <p className="text-xs font-semibold text-red-400">{count} high-risk order{count !== 1 ? "s" : ""}</p>
          <p className="mt-1 text-[11px] text-zinc-500">Requires your attention</p>
          <Link
            href="/shield"
            onClick={() => setShow(false)}
            className="mt-2 block rounded-lg bg-purple-600 px-3 py-1.5 text-center text-xs font-semibold text-white"
          >
            View in ZioShield
          </Link>
        </div>
      )}
    </div>
  )
}

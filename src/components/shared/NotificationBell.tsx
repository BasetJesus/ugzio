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
        className="relative rounded-lg px-2 py-1 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
      >
        ◈
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--risk-red)] text-[9px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      </button>
      {show && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-lg)] z-50">
          <p className="text-xs font-semibold text-[var(--risk-red)]">{count} commande à haut risque{count !== 1 ? "s" : ""}</p>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Nécessite votre attention</p>
          <Link
            href="/overview"
            onClick={() => setShow(false)}
            className="mt-2 block rounded-md bg-[var(--accent)] px-3 py-1.5 text-center text-xs font-semibold text-white"
          >
            Voir dans ZioShield
          </Link>
        </div>
      )}
    </div>
  )
}

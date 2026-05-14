"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  children: React.ReactNode
}

const IDLE_TIMEOUT_MS = 30000
const ACTIVITY_RESET_MS = 2000

export default function OperationalPresenceLayer({ children }: Props) {
  const [mounted, setMounted] = useState(false)
  const [idle, setIdle] = useState(false)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    function onActivity() {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (activityTimer.current) clearTimeout(activityTimer.current)

      setIdle(false)

      activityTimer.current = setTimeout(() => {
        idleTimer.current = setTimeout(() => {
          setIdle(true)
        }, IDLE_TIMEOUT_MS)
      }, ACTIVITY_RESET_MS)
    }

    const events = ["mousemove", "touchstart", "scroll", "keydown", "click"]
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }))

    idleTimer.current = setTimeout(() => setIdle(true), IDLE_TIMEOUT_MS)

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity))
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (activityTimer.current) clearTimeout(activityTimer.current)
    }
  }, [mounted])

  return (
    <div
      className={
        "transition-all duration-1000 ease-in-out" +
        (mounted ? " animate-view-fade-in" : " opacity-0") +
        (idle ? " presence-idle" : "")
      }
      style={{ transitionProperty: "opacity, filter" }}
    >
      {children}
    </div>
  )
}

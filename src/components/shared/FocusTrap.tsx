"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface FocusTrapProps {
  active: boolean
  children: ReactNode
}

export default function FocusTrap({ active, children }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return

      const focusable = container.querySelectorAll<HTMLElement>(focusableSelector)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // Focus first element on open
    const firstFocusable = container.querySelector<HTMLElement>(focusableSelector)
    requestAnimationFrame(() => firstFocusable?.focus())

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [active])

  return <div ref={containerRef}>{children}</div>
}

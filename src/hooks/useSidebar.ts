"use client"

import { useState, useCallback, useSyncExternalStore } from "react"

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("uz-sidebar-collapsed") === "true"
    } catch {
      return false
    }
  })

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem("uz-sidebar-collapsed", String(next))
      } catch {
        /* noop */
      }
      return next
    })
  }, [])

  return { isCollapsed, toggle }
}

function subscribeToMatchMedia(query: string) {
  return (callback: () => void) => {
    const mq = window.matchMedia(query)
    mq.addEventListener("change", callback)
    return () => mq.removeEventListener("change", callback)
  }
}

function getSnapshot(query: string) {
  return () => window.matchMedia(query).matches
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribeToMatchMedia("(max-width: 767px)"),
    getSnapshot("(max-width: 767px)"),
    () => false
  )
}

export function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToMatchMedia("(min-width: 1024px)"),
    getSnapshot("(min-width: 1024px)"),
    () => true
  )
}

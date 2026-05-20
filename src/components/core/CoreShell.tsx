"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { stateFromPath } from "@/lib/core/system-state"
import type { SystemState } from "@/lib/core/system-state"
import SidebarNav from "@/components/nav/SidebarNav"
import MobileBottomNav from "@/components/shared/MobileBottomNav"
import { PageTransition } from "@/components/shared/PageTransition"
import PostRegistrationPopup from "@/components/onboarding/PostRegistrationPopup"

interface Props {
  children: React.ReactNode
  orgName: string
  planName: string
  orgId: string
  completedCount: number
  pendingCount?: number
  highRiskCount?: number
  brandDescription?: string
}

export default function CoreShell({ children, orgName, orgId, pendingCount = 0, highRiskCount = 0, brandDescription = "" }: Props) {
  const pathname = usePathname()
  const currentState = stateFromPath(pathname)
  const [displayState, setDisplayState] = useState<SystemState>(currentState)
  const [animating, setAnimating] = useState(false)
  const prevState = useRef(currentState)
  const [showPostRegistration, setShowPostRegistration] = useState(false)

  useEffect(() => {
    if (!brandDescription && orgId) {
      const t = setTimeout(() => setShowPostRegistration(true), 800)
      return () => clearTimeout(t)
    }
  }, [brandDescription, orgId])

  useEffect(() => {
    if (prevState.current !== currentState) {
      setAnimating(true)
      const timer = setTimeout(() => {
        setDisplayState(currentState)
        prevState.current = currentState
        requestAnimationFrame(() => {
          setAnimating(false)
        })
      }, 150)
      return () => clearTimeout(timer)
    }
    prevState.current = currentState
    setDisplayState(currentState)
  }, [currentState])

  return (
    <div className="mx-auto flex min-h-dvh bg-[var(--bg-base)]">
      <SidebarNav
        orgName={orgName}
pendingCount={pendingCount}
        highRiskCount={highRiskCount}
      />
      <div className="relative flex flex-1 flex-col">
        <main className="flex-1 overflow-y-auto pb-24 sm:pb-0">
          <div
            className={`px-4 py-5 sm:px-8 sm:py-6 ${
              animating
                ? "opacity-0"
                : ""
            }`}
            key={displayState}
          >
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
      <MobileBottomNav pendingCount={pendingCount} highRiskCount={highRiskCount} />
      <PostRegistrationPopup
        open={showPostRegistration}
        onClose={() => setShowPostRegistration(false)}
      />
    </div>
  )
}





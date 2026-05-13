"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { stateFromPath } from "@/lib/core/system-state"
import type { SystemState } from "@/lib/core/system-state"
import LiveSystemHeader from "./LiveSystemHeader"
import SystemFlowNavigator from "./SystemFlowNavigator"
import MobileBottomNav from "@/components/shared/MobileBottomNav"
import LanguageToggle from "@/components/shared/LanguageToggle"

interface Props {
  children: React.ReactNode
  orgName: string
  planName: string
  orgId: string
  completedCount: number
  revenueAtRisk: number
}

export default function CoreShell({ children, orgName, planName, orgId, completedCount, revenueAtRisk }: Props) {
  const pathname = usePathname()
  const currentState = stateFromPath(pathname)
  const [displayState, setDisplayState] = useState<SystemState>(currentState)
  const [animating, setAnimating] = useState(false)
  const prevState = useRef(currentState)

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
    <div className="mx-auto flex min-h-dvh max-w-6xl pb-16 sm:pb-0">
      <SystemFlowNavigator
        orgName={orgName}
        planName={planName}
        completedCount={completedCount}
      />
      <div className="flex flex-1 flex-col">
        <LiveSystemHeader
          orgName={orgName}
          planName={planName}
          orgId={orgId}
          revenueAtRisk={revenueAtRisk}
        />
        <main className="flex-1 overflow-y-auto">
          <div
            className={`p-4 sm:p-6 ${animating ? "animate-view-fade-out opacity-0" : "animate-view-fade-in"}`}
            key={displayState}
          >
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
      <div className="fixed bottom-20 right-4 z-50 sm:bottom-4">
        <LanguageToggle />
      </div>
    </div>
  )
}

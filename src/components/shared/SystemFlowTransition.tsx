"use client"

import { usePathname } from "next/navigation"
import { stateFromPath, type SystemState } from "@/lib/core/system-state"

const stateLabels: Record<SystemState, string> = {
  LIVE: "Live Monitoring",
  DECISION: "Decision Queue",
  HISTORY: "Order History",
  ACTIVATION: "System Setup",
}

export default function SystemFlowTransition() {
  const pathname = usePathname()
  const state = stateFromPath(pathname)

  return null
}

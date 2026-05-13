export type SystemState = "LIVE" | "DECISION" | "HISTORY" | "ACTIVATION"

export interface SystemStateConfig {
  state: SystemState
  label: string
  description: string
  route: string
  icon: string
  color: string
}

export const SYSTEM_STATES: Record<SystemState, SystemStateConfig> = {
  LIVE: {
    state: "LIVE",
    label: "Live",
    description: "What is happening now",
    route: "/overview",
    icon: "\u25CF",
    color: "var(--accent)",
  },
  DECISION: {
    state: "DECISION",
    label: "Decision",
    description: "What needs action",
    route: "/confirm",
    icon: "\u25C6",
    color: "var(--success-green)",
  },
  HISTORY: {
    state: "HISTORY",
    label: "History",
    description: "What happened",
    route: "/orders",
    icon: "\u25B8",
    color: "var(--warning-amber)",
  },
  ACTIVATION: {
    state: "ACTIVATION",
    label: "Setup",
    description: "How system starts",
    route: "/onboarding",
    icon: "\u25CB",
    color: "var(--risk-red)",
  },
}

export function stateFromPath(pathname: string): SystemState {
  if (pathname.startsWith("/confirm")) return "DECISION"
  if (pathname.startsWith("/orders")) return "HISTORY"
  if (pathname.startsWith("/onboarding")) return "ACTIVATION"
  return "LIVE"
}

export function configFromPath(pathname: string): SystemStateConfig {
  return SYSTEM_STATES[stateFromPath(pathname)]
}

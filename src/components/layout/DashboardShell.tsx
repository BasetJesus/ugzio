"use client"

import Sidebar from "./Sidebar"
import BottomTabBar from "./BottomTabBar"
import MobileHeader from "./MobileHeader"
import { useSidebar, useIsDesktop } from "@/hooks/useSidebar"

interface SidebarProps {
  planName?: string
  pendingCount?: number
  highRiskCount?: number
  ugcPendingCount?: number
}

interface DashboardShellProps {
  children: React.ReactNode
  sidebarProps?: SidebarProps
}

export default function DashboardShell({ children, sidebarProps }: DashboardShellProps) {
  const { isCollapsed } = useSidebar()
  const isDesktop = useIsDesktop()

  return (
    <div className="flex min-h-dvh bg-[#0B0D12]">
      <Sidebar
        planName={sidebarProps?.planName}
        pendingCount={sidebarProps?.pendingCount ?? 0}
        highRiskCount={sidebarProps?.highRiskCount ?? 0}
        ugcPendingCount={sidebarProps?.ugcPendingCount ?? 0}
      />
      <div
        className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto h-screen transition-all duration-200 ease-out md:ml-16 pb-16 md:pb-0"
        style={isDesktop ? { marginLeft: isCollapsed ? 64 : 192 } : undefined}
      >
        <MobileHeader />
        {children}
      </div>
      <BottomTabBar
        pendingCount={sidebarProps?.pendingCount ?? 0}
        highRiskCount={sidebarProps?.highRiskCount ?? 0}
      />
    </div>
  )
}

"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { stateFromPath } from "@/lib/core/system-state"
import type { SystemState } from "@/lib/core/system-state"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
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
  userName?: string
}

function getHeaderForPath(pathname: string) {
  const p = pathname.replace(/\/$/, "")
  if (p.startsWith("/orders/import")) return { title: "Import Orders", emoji: "📥", subtitle: "Bulk import orders from CSV" }
  if (p.startsWith("/settings/branding")) return { title: "Branding", emoji: "🎨", subtitle: "Customize your brand appearance" }
  if (p.startsWith("/settings/connectivity")) return { title: "Connectivity", emoji: "🔗", subtitle: "Manage integrations and API connections" }
  if (p.startsWith("/settings/delivery")) return { title: "Delivery", emoji: "🚚", subtitle: "Configure delivery providers and costs" }
  if (p.startsWith("/settings/billing")) return { title: "Billing", emoji: "💳", subtitle: "Subscription and payment settings" }
  if (p.startsWith("/settings/security")) return { title: "Security", emoji: "🔒", subtitle: "Security preferences and access" }
  if (p.startsWith("/settings/ugc")) return { title: "UGC Templates", emoji: "📝", subtitle: "Configure UGC request templates" }
  if (p.startsWith("/settings")) return { title: "Settings", emoji: "⚙️", subtitle: "Configure your account and preferences" }
  if (p === "/overview") return { title: "Overview", emoji: "👋", subtitle: "Live revenue protection status" }
  if (p.startsWith("/confirm")) return { title: "Confirm", emoji: "✅", subtitle: "Review and confirm orders before shipping — every decision protects your revenue." }
  if (p.startsWith("/orders")) return { title: "Orders", emoji: "📦", subtitle: "All orders and their status" }
  if (p.startsWith("/inbox")) return { title: "Inbox", emoji: "📥", subtitle: "Customer content and messages" }
  if (p.startsWith("/capture")) return { title: "UGC & Captions", emoji: "📸", subtitle: "Capture and organize customer content" }
  if (p.startsWith("/flow")) return { title: "ZioFlow", emoji: "✨", subtitle: "Auto-repost flywheel" }
  if (p.startsWith("/growth")) return { title: "Growth", emoji: "📈", subtitle: "UGC performance metrics" }
  if (p.startsWith("/shield")) return { title: "ZioShield", emoji: "🛡️", subtitle: "Stop fake COD orders before they waste your logistics capital." }
  if (p.startsWith("/blacklist")) return { title: "Blacklist", emoji: "🚫", subtitle: "Shared blacklist management" }
  if (p.startsWith("/stats")) return { title: "Statistics", emoji: "📊", subtitle: "Advanced analytics" }
  if (p.startsWith("/onboarding")) return { title: "Welcome", emoji: "🚀", subtitle: "Set up your shop" }
  return { title: "UGZIO", emoji: "🛡️", subtitle: "Protect & Grow" }
}

export default function CoreShell({ children, orgName, planName, orgId, userName, pendingCount = 0, highRiskCount = 0, brandDescription = "" }: Props) {
  const pathname = usePathname()
  const currentState = stateFromPath(pathname)
  const [displayState, setDisplayState] = useState<SystemState>(currentState)
  const [animating, setAnimating] = useState(false)
  const prevState = useRef(currentState)
  const [showPostRegistration, setShowPostRegistration] = useState(false)
  const header = getHeaderForPath(pathname)

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
    <div className="mx-auto flex h-dvh bg-[var(--bg-base)]">
      <Sidebar
        planName={planName}
        pendingCount={pendingCount}
        highRiskCount={highRiskCount}
      />
      <div className="relative flex flex-1 flex-col sm:ml-48">
        <Header
          title={header.title}
          emoji={header.emoji}
          subtitle={header.subtitle}
          userName={userName}
          shopName={orgName}
          notificationCount={pendingCount}
        />
        <main className="flex-1 overflow-y-auto pb-24 sm:pb-0">
          <div
            className={`px-5 py-5 sm:px-8 sm:py-5 ${
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





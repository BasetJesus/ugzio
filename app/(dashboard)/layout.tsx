import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"
import { getOrgFromUserId } from "@/lib/billing/enforce"
import { getOrgWithPlan, getActivationEventCount } from "@/services/org.service"
import { getNeedsConfirmCount } from "@/services/demo-orchestrator.service"
import { Suspense } from "react"
import PageTransition from "@/components/layout/PageTransition"
import DashboardShell from "@/components/layout/DashboardShell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const orgId = await getOrgFromUserId(session.user.id)
  if (!orgId) redirect("/onboarding")

  const [org, pendingCount] = await Promise.all([
    getOrgWithPlan(orgId),
    getNeedsConfirmCount(orgId),
  ])

  return (
    <DashboardShell
      sidebarProps={{
        planName: org?.planName ?? "ZioPro",
        pendingCount,
        highRiskCount: 0,
      }}
    >
      <Suspense fallback={null}>
        <PageTransition>{children}</PageTransition>
      </Suspense>
    </DashboardShell>
  )
}

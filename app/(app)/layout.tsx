import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { registerCoreSubscribers } from "@/lib/events/subscribers";
import { getRevenueAtRisk } from "@/services/demo-orchestrator.service";
import { getOrgWithPlan, getActivationEventCount } from "@/services/org.service";
import CoreShell from "@/components/core/CoreShell";

registerCoreSubscribers();

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [org, completedCount, revenueAtRisk] = await Promise.all([
    getOrgWithPlan(orgId),
    getActivationEventCount(orgId),
    getRevenueAtRisk(orgId),
  ]);

  return (
    <CoreShell
      orgName={org?.name ?? ""}
      planName={org?.planName ?? "free"}
      orgId={orgId}
      completedCount={completedCount}
      revenueAtRisk={revenueAtRisk}
    >
      {children}
    </CoreShell>
  );
}

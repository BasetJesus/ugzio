import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getNeedsConfirmCount } from "@/services/demo-orchestrator.service";
import { getOrgWithPlan, getActivationEventCount } from "@/services/org.service";
import CoreShell from "@/components/core/CoreShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [org, completedCount, pendingCount] = await Promise.all([
    getOrgWithPlan(orgId),
    getActivationEventCount(orgId),
    getNeedsConfirmCount(orgId),
  ]);

  return (
    <CoreShell
      orgName={org?.name ?? ""}
      planName={org?.planName ?? "free"}
      orgId={orgId}
      completedCount={completedCount}
      pendingCount={pendingCount}
      brandDescription={org?.brandDescription ?? ""}
    >
      {children}
    </CoreShell>
  );
}

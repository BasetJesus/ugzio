import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getActivationStatus } from "@/services/org.service";
import OnboardingFlow from "./OnboardingFlow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);

  if (!orgId) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black p-4">
        <OnboardingFlow />
      </div>
    );
  }

  const orders = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null },
  });
  const events = await prisma.activationEvent.findMany({
    where: { organizationId: orgId },
  });

  const activation = getActivationStatus(orgId, events);
  const isFreshOrg = orders === 0;

  if (isFreshOrg) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black p-4">
        <OnboardingFlow existingOrgId={orgId} />
      </div>
    );
  }

  if (activation.completedSteps < activation.totalSteps) {
    return (
      <div className="mx-auto max-w-lg p-4 sm:p-0 mt-12">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h1 className="text-xl font-bold text-zinc-100">Your shop is ready</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {activation.completedSteps} of {activation.totalSteps} steps completed
          </p>
          <div className="mt-4">
            <a
              href="/operations"
              className="inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
            >
              Go to operations
            </a>
          </div>
        </div>
      </div>
    );
  }

  redirect("/operations");
}

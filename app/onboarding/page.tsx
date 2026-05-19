import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getOrderCount, getActivationEvents, getActivationStatus } from "@/services/org.service";
import OnboardingFlow from "./OnboardingFlow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);

  if (!orgId) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-base)] p-4">
        <OnboardingFlow />
      </div>
    );
  }

  const [orders, events] = await Promise.all([
    getOrderCount(orgId).catch(() => 0),
    getActivationEvents(orgId).catch(() => []),
  ]);

  const activation = getActivationStatus(orgId, events);
  const isFreshOrg = orders === 0;

  if (isFreshOrg) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-base)] p-4">
        <OnboardingFlow existingOrgId={orgId} />
      </div>
    );
  }

  if (activation.completedSteps < activation.totalSteps) {
    return (
      <div className="mx-auto max-w-[32rem] p-4 sm:p-0 mt-12">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Boutique prête</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {activation.completedSteps}/{activation.totalSteps} étapes complétées
          </p>
          <div className="mt-4">
            <a
              href="/overview"
              className="inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Voir le tableau de bord
            </a>
          </div>
        </div>
      </div>
    );
  }

  redirect("/overview");
}

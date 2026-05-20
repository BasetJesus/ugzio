import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getSubscription, getUsage, getAllPlans } from "@/services/subscription.service";
import BillingSettingsClient from "@/components/settings/BillingSettingsClient";

export const dynamic = "force-dynamic";

export default async function BillingSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [subscription, usage, plans] = await Promise.all([
    getSubscription(orgId).catch(() => null),
    getUsage(orgId).catch(() => ({ ordersProcessed: 0, ordersLimit: 0, verificationsSent: 0, verificationsLimit: 0, aiInsightsGenerated: 0, aiInsightsLimit: 0 })),
    getAllPlans().catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <a
          href="/settings"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          → جميع الإعدادات
        </a>
      </div>

      <BillingSettingsClient
        orgId={orgId}
        subscription={subscription}
        usage={usage}
        plans={plans}
      />
    </div>
  );
}

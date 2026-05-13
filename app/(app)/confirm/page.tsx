import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getConfirmationQueue } from "@/services/confirmation.service";
import ConfirmationPanel from "@/components/confirm/ConfirmationPanel";

export const dynamic = "force-dynamic";

export default async function ConfirmPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const queue = await getConfirmationQueue(orgId);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Confirmation queue</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          {queue.pendingCount} pending &middot; {queue.contactedCount} contacted &middot; {queue.total} total
        </p>
      </div>

      <ConfirmationPanel
        items={queue.items}
        pendingCount={queue.pendingCount}
        contactedCount={queue.contactedCount}
        total={queue.total}
      />
    </div>
  );
}

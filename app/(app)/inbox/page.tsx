import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getUgcItems, getUgcStats } from "@/services/grow.service";
import UgcInboxClient from "@/components/grow/UgcInboxClient";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [items, stats] = await Promise.all([
    getUgcItems(orgId),
    getUgcStats(orgId),
  ]);

  return (
    <div data-state="live" className="space-y-section">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-[var(--text-primary)]">Boîte UGC</h1>
      </div>
      <UgcInboxClient initialItems={items} stats={stats} />
    </div>
  );
}

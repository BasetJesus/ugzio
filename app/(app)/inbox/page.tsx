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

  let items: Awaited<ReturnType<typeof getUgcItems>> = [];
  let stats: Awaited<ReturnType<typeof getUgcStats>> = { total: 0, received: 0, approved: 0, rejected: 0, rate: 0 };
  try {
    [items, stats] = await Promise.all([
      getUgcItems(orgId),
      getUgcStats(orgId),
    ]);
  } catch (e) {
    console.error("[inbox] service error", e);
  }

  return <UgcInboxClient initialItems={items} stats={stats} />;
}

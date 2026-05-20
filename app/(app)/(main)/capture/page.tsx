import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getUgcItems, getUgcStats } from "@/services/grow.service";
import ZioCaptureClient from "./ZioCaptureClient";

export const dynamic = "force-dynamic";

export default async function CapturePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [items, stats] = await Promise.all([
    getUgcItems(orgId),
    getUgcStats(orgId),
  ]);

  return <ZioCaptureClient items={items} stats={stats} />;
}

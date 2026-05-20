import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getOrgCaptionProfile } from "@/services/caption.service";
import { getUgcItems } from "@/services/grow.service";
import { getSocialConnections } from "@/services/social-connection.service";
import { getPublishedPosts, getFlowStats } from "@/services/zioflow.service";
import ZioFlowDashboard from "./ZioFlowDashboard";

export const dynamic = "force-dynamic";

export default async function FlowPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [profile, ugcItems, connections, publishedPosts, stats] = await Promise.all([
    getOrgCaptionProfile(orgId).catch(() => null),
    getUgcItems(orgId).catch(() => []),
    getSocialConnections(orgId).catch(() => []),
    getPublishedPosts(orgId).catch(() => []),
    getFlowStats(orgId).catch(() => ({ totalPublished: 0, totalQueued: 0, byPlatform: [] })),
  ]);

  return (
    <ZioFlowDashboard
      initialProfile={profile}
      approvedUgc={ugcItems.filter((i) => i.status === "approved")}
      connections={connections}
      initialPosts={publishedPosts}
      stats={stats}
    />
  );
}

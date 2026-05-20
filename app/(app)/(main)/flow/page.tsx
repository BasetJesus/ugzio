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
    getOrgCaptionProfile(orgId),
    getUgcItems(orgId),
    getSocialConnections(orgId),
    getPublishedPosts(orgId),
    getFlowStats(orgId),
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

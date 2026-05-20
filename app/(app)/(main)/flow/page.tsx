import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getOrgCaptionProfile } from "@/services/caption.service";
import CaptionFlowClient from "./CaptionFlowClient";

export const dynamic = "force-dynamic";

export default async function FlowPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const profile = await getOrgCaptionProfile(orgId);

  return <CaptionFlowClient initialProfile={profile} />;
}

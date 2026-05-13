import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getSuccessStats } from "@/services/success.service";
import SuccessCards from "./SuccessCards";

export const dynamic = "force-dynamic";

export default async function SuccessPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const stats = await getSuccessStats(orgId);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/10 text-sm">🏆</span>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Success</h1>
          <p className="text-xs text-zinc-500">What converts & shareable results</p>
        </div>
      </div>
      <SuccessCards stats={stats} />
    </div>
  );
}

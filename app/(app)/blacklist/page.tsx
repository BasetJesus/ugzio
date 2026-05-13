import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getBlacklistedPhones } from "@/services/risk.service";
import BlacklistTable from "./BlacklistTable";

export const dynamic = "force-dynamic";

export default async function BlacklistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const blacklisted = await getBlacklistedPhones(orgId);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500/10 text-sm">🚫</span>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Blacklist</h1>
          <p className="text-xs text-zinc-500">{blacklisted.length} blacklisted buyers</p>
        </div>
      </div>
      <BlacklistTable items={blacklisted.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }))} orgId={orgId} />
    </div>
  );
}

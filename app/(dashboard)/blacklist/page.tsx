import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import BlacklistTable from "./BlacklistTable";

export const dynamic = "force-dynamic";

export default async function BlacklistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const blacklisted = await prisma.order.findMany({
    where: { organizationId: orgId, riskLevel: "high", deletedAt: null },
    select: { buyerPhone: true, buyerName: true, createdAt: true },
    distinct: ["buyerPhone"],
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Blacklist</h1>
        <p className="text-sm text-zinc-400">{blacklisted.length} blacklisted buyers</p>
      </div>
      <BlacklistTable items={blacklisted.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }))} orgId={orgId} />
    </div>
  );
}

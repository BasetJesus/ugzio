import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import TrustScoreBar from "@/components/dashboard/TrustScoreBar";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const orders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
          <p className="text-zinc-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-200">{order.buyerName}</p>
                  <p className="truncate text-sm text-zinc-500">{order.buyerPhone}</p>
                  <p className="mt-1 text-sm text-zinc-400">{order.buyerWilaya ?? "—"}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium text-purple-300">{Number(order.amount).toFixed(3)} TND</p>
                  <span className={`text-xs font-semibold ${
                    order.riskLevel === "high" ? "text-red-400" : order.riskLevel === "medium" ? "text-orange-400" : "text-green-400"
                  }`}>
                    {order.riskLevel.toUpperCase()}
                  </span>
                  {order.verificationStatus !== "none" && (
                    <p className="mt-1 text-xs text-emerald-400">✓ Verified</p>
                  )}
                  <div className="mt-2 w-24">
                    <TrustScoreBar score={order.trustScore} size="sm" />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-600">{order.createdAt.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

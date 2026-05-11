import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const ordersThisWeek = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null, createdAt: { gte: weekStart } },
  });

  const rtsThisWeek = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null, status: "REFUSED", createdAt: { gte: weekStart } },
  });

  const rtsRate = ordersThisWeek > 0 ? Math.round((rtsThisWeek / ordersThisWeek) * 100) : 0;

  const ugcThisWeek = await prisma.ugcItem.count({
    where: { order: { organizationId: orgId }, createdAt: { gte: weekStart } },
  });

  const actionOrders = await prisma.order.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: { in: ["PRE_SHIPPING_CONFIRM_SENT", "PENDING_RESCHEDULE"] },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const highRiskOrders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null, riskLevel: "high", status: { notIn: ["REFUSED", "INTELLIGENT_CANCEL", "DELIVERED", "UGC_RECEIVED"] } },
    orderBy: { trustScore: "asc" },
    take: 5,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Tableau de Bord</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="mb-1 text-xs font-medium text-zinc-500">Commandes cette semaine</p>
          <p className="text-3xl font-bold tracking-tight text-purple-400">{ordersThisWeek}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="mb-1 text-xs font-medium text-zinc-500">RTS cette semaine</p>
          <p className={`text-3xl font-bold tracking-tight ${rtsRate > 15 ? "text-red-400" : "text-emerald-400"}`}>
            {rtsRate}%
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="mb-1 text-xs font-medium text-zinc-500">UGC reçus cette semaine</p>
          <p className="text-3xl font-bold tracking-tight text-pink-400">{ugcThisWeek}</p>
        </div>
      </div>

      <div className="space-y-3">
        {highRiskOrders.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-red-400">🔴 Commandes à risque</h2>
            <div className="space-y-2">
              {highRiskOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-red-900/30 bg-red-950/20 px-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-200">{order.buyerName}</p>
                    <p className="text-xs text-zinc-500">{order.buyerPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">{order.trustScore}</p>
                    <p className="text-xs text-zinc-600">{Number(order.amount).toFixed(3)} TND</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {actionOrders.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-orange-400">🔄 En attente d&apos;action</h2>
            <div className="space-y-2">
              {actionOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-200">{order.buyerName}</p>
                    <p className="text-xs text-zinc-500">{order.buyerPhone}</p>
                  </div>
                  <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-400">
                    {order.status === "PENDING_RESCHEDULE" ? "Reschedule" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {actionOrders.length === 0 && highRiskOrders.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <p className="text-lg font-medium text-emerald-400">Tout est en ordre ✅</p>
            <p className="mt-1 text-sm text-zinc-500">Aucune action requise</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/orders/new"
          className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500"
        >
          + Nouvelle commande
        </Link>
      </div>
    </div>
  );
}

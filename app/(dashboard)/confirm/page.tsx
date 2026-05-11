import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { bg: string; text: string; label: string }> = {
  none: { bg: "bg-zinc-800", text: "text-zinc-400", label: "Pending" },
  sent: { bg: "bg-blue-500/15", text: "text-blue-400", label: "Sent" },
  confirmed: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Confirmed ✓" },
  failed: { bg: "bg-red-500/15", text: "text-red-400", label: "Failed" },
  expired: { bg: "bg-orange-500/15", text: "text-orange-400", label: "Expired" },
};

export default async function ConfirmPage() {
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
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">ZioConfirm Queue</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
          <p className="text-zinc-500">No orders to verify</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const meta = STATUS_META[order.verificationStatus] ?? STATUS_META.none;
            return (
              <div key={order.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-200">{order.buyerName}</p>
                  <p className="truncate text-xs text-zinc-500">{order.buyerPhone}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}>
                    {meta.label}
                  </span>
                  <p className="text-sm font-medium text-purple-300">{Number(order.amount).toFixed(3)} TND</p>
                  <p className="text-xs text-zinc-600">{order.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

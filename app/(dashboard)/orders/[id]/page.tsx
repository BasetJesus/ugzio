import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import TrustScoreBar from "@/components/dashboard/TrustScoreBar";
import RiskBadge from "@/components/dashboard/RiskBadge";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import StatusTransitionButtons from "@/components/orders/StatusTransitionButtons";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: {
      conversations: { include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } }, take: 1 },
      ugcItems: true,
      timeline: { orderBy: { scheduledFor: "asc" } },
    },
  });

  if (!order) notFound();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <Link href="/orders" className="hover:text-zinc-300">Orders</Link>
        <span>/</span>
        <span className="text-zinc-300">{order.id.slice(0, 8)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-zinc-100">{order.buyerName}</h1>
                <p className="text-sm text-zinc-400">{order.buyerPhone}</p>
                {order.buyerWilaya && (
                  <p className="text-xs text-zinc-500">{order.buyerWilaya}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">
                  {Number(order.amount).toFixed(3)} TND
                </p>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <OrderStatusBadge status={order.status} />
                  <RiskBadge risk={order.riskLevel as "low" | "medium" | "high"} />
                </div>
              </div>
            </div>

            {order.product && (
              <div className="mt-4 border-t border-zinc-800/40 pt-4">
                <p className="text-xs text-zinc-500">Product</p>
                <p className="text-sm text-zinc-300">{order.product}</p>
              </div>
            )}

            <div className="mt-4 border-t border-zinc-800/40 pt-4">
              <p className="text-xs text-zinc-500 mb-2">Trust Score</p>
              <div className="w-48">
                <TrustScoreBar score={order.trustScore} size="md" />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/40 pt-4">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Actions</h2>
            <StatusTransitionButtons orderId={order.id} currentStatus={order.status} />
          </div>

          {order.ugcItems.length > 0 && (
            <div className="border-t border-zinc-800/40 pt-4">
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">UGC Media</h2>
              <div className="space-y-2">
                {order.ugcItems.map((ugc) => (
                  <div key={ugc.id} className="flex items-center justify-between rounded-md bg-zinc-900/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{ugc.mediaType === "video" ? "🎬" : "📸"}</span>
                      <span className="text-xs text-zinc-400">{ugc.mediaUrl.split("/").pop()}</span>
                    </div>
                    <span className="text-xs text-zinc-500">{ugc.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-600 w-16 shrink-0">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-zinc-300">Order Created</span>
                </div>
              </div>
              {order.timeline.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600 w-16 shrink-0">
                    {new Date(entry.scheduledFor).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${entry.sentAt ? "bg-green-500" : "bg-zinc-700"}`} />
                    <span className={`text-xs ${entry.sentAt ? "text-zinc-300" : "text-zinc-500"}`}>
                      {entry.eventType} {entry.sentAt ? "✓" : "(scheduled)"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.conversations.length > 0 && (
            <div className="border-t border-zinc-800/40 pt-4">
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">Conversation</h2>
              <Link
                href={`/inbox?id=${order.conversations[0].id}`}
                className="text-sm text-amber-400 hover:underline"
              >
                View in Inbox →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import SuccessCards from "./SuccessCards";

export const dynamic = "force-dynamic";

export default async function SuccessPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const totalOrders = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null } });
  const highRiskBlocked = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null, riskLevel: "high" } });

  const totalAmount = await prisma.order.aggregate({
    where: { organizationId: orgId, deletedAt: null },
    _sum: { amount: true },
  });
  const revenueSaved = Math.round(Number(totalAmount._sum.amount ?? 0) * 0.3);

  const refusedOrders = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "REFUSED" } });
  const rtsRate = totalOrders > 0 ? Math.round((refusedOrders / totalOrders) * 100) : 0;
  const rtsBefore = Math.min(100, rtsRate + 25);
  const rtsAfter = rtsRate;

  const deliveredOrders = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "DELIVERED" } });
  const verificationRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  const stats = {
    ordersProtected: totalOrders,
    revenueSaved,
    rtsBefore,
    rtsAfter,
    highRiskBlocked,
    verificationRate,
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">UGZIO Success</h1>
        <p className="text-sm text-zinc-400">Partagez vos résultats sur WhatsApp</p>
      </div>
      <SuccessCards stats={stats} />
    </div>
  );
}

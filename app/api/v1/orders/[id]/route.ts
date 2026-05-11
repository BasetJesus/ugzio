import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { canTransition } from "@/lib/zioconfirm/state-machine";
import { scheduleD3UgcAsk } from "@/lib/zioconfirm/service";
import { alertSeller, refusedAlert } from "@/lib/alerts/seller";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status: newStatus } = body;

  if (!newStatus) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!canTransition(order.status as never, newStatus as never)) {
    return NextResponse.json(
      { error: `Invalid transition: ${order.status} → ${newStatus}` },
      { status: 400 },
    );
  }

  await prisma.order.update({
    where: { id },
    data: { status: newStatus },
  });

  if (newStatus === "DELIVERED") {
    await scheduleD3UgcAsk(id);
  }

  if (newStatus === "REFUSED") {
    await alertSeller(orgId, refusedAlert(order.buyerName));
  }

  return NextResponse.json({ id, status: newStatus });
}

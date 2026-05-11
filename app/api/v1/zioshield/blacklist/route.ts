import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { addToBlacklist, removeFromBlacklist } from "@/lib/zioshield/blacklist";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const blacklisted = await prisma.order.findMany({
    where: { organizationId: orgId, riskLevel: "high", deletedAt: null },
    select: { buyerPhone: true, buyerName: true, createdAt: true },
    distinct: ["buyerPhone"],
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(blacklisted);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }
  const { phone } = await request.json();
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }
  await addToBlacklist(orgId, phone);

  const existing = await prisma.activationEvent.findFirst({
    where: { organizationId: orgId, eventType: "FIRST_HIGH_RISK_BLOCKED" },
  });
  if (!existing) {
    await prisma.activationEvent.create({
      data: { organizationId: orgId, eventType: "FIRST_HIGH_RISK_BLOCKED" },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }
  const { phone } = await request.json();
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }
  await removeFromBlacklist(orgId, phone);
  return NextResponse.json({ success: true });
}

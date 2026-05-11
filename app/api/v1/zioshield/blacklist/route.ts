import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addToBlacklist, removeFromBlacklist, isBlacklisted } from "@/lib/zioshield/blacklist";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const blacklisted = await prisma.order.findMany({
    where: { organizationId: orgId, riskLevel: "high", deletedAt: null },
    select: { buyerPhone: true, buyerName: true, createdAt: true },
    distinct: ["buyerPhone"],
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(blacklisted);
}

export async function POST(request: NextRequest) {
  const { orgId, phone } = await request.json();
  if (!orgId || !phone) {
    return NextResponse.json({ error: "orgId and phone required" }, { status: 400 });
  }
  await addToBlacklist(orgId, phone);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { orgId, phone } = await request.json();
  if (!orgId || !phone) {
    return NextResponse.json({ error: "orgId and phone required" }, { status: 400 });
  }
  await removeFromBlacklist(orgId, phone);
  return NextResponse.json({ success: true });
}

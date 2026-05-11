import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { organizationId: orgId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      order: { select: { trustScore: true, status: true } },
      messages: { select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json(conversations);
}

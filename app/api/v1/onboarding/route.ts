import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";

export async function POST(request: Request) {
  console.log("[OnboardingAPI] POST /api/v1/onboarding");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("[OnboardingAPI] No session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[OnboardingAPI] session user:", session.user.id);

  let orgId = await getOrgFromUserId(session.user.id);
  console.log("[OnboardingAPI] orgId:", orgId);

  const { shopName, sellerPhone } = await request.json();
  console.log("[OnboardingAPI] body:", { shopName, sellerPhone });

  if (!shopName) {
    return NextResponse.json({ error: "shopName is required" }, { status: 400 });
  }

  // Create org + membership if user has no org yet
  if (!orgId) {
    const slug = shopName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const org = await prisma.organization.create({
      data: {
        name: shopName,
        slug: `${slug}-${session.user.id.slice(0, 6)}`,
        sellerPhone: sellerPhone ?? null,
        sellerName: shopName,
      },
    });

    await prisma.organizationMember.create({
      data: { organizationId: org.id, userId: session.user.id, role: "owner" },
    });

    const plan = await prisma.plan.findUnique({ where: { name: "free" } });
    if (plan) {
      await prisma.subscription.create({
        data: {
          organizationId: org.id,
          planId: plan.id,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return NextResponse.json({ success: true });
  }

  // Existing org — just update
  await prisma.organization.update({
    where: { id: orgId },
    data: {
      name: shopName,
      sellerPhone: sellerPhone ?? undefined,
      sellerName: shopName,
    },
  });

  return NextResponse.json({ success: true });
}

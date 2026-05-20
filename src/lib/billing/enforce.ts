import { prisma } from "@/lib/db";

export async function enforcePlanGate(orgId: string, featureKey: string): Promise<boolean> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { subscription: { include: { plan: true } } },
    });
    if (!org?.subscription) return false;

    const flag = await prisma.featureFlag.findUnique({ where: { key: featureKey } });
    if (!flag?.planGate) return true;

    const plan = org.subscription.plan;
    const tiers = ["free", "ziogrow", "ziopro", "ziomax"];
    const orgTier = tiers.indexOf(plan.name);
    const requiredTier = tiers.indexOf(flag.planGate);
    if (requiredTier === -1) return true;
    return orgTier >= requiredTier;
  } catch {
    return false;
  }
}

export async function getOrgFromUserId(userId: string): Promise<string | null> {
  try {
    const member = await prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: true },
    });
    return member?.organization.id ?? null;
  } catch {
    return null;
  }
}

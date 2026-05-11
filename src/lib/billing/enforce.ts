import { prisma } from "@/lib/db";

export async function enforcePlanGate(orgId: string, featureKey: string): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { subscription: { include: { plan: true } } },
  });
  if (!org?.subscription) return false;

  const flag = await prisma.featureFlag.findUnique({ where: { key: featureKey } });
  if (!flag?.planGate) return true; // no gate = allowed

  const plan = org.subscription.plan;
  const tiers = ["starter", "grower", "pro", "scale"];
  const orgTier = tiers.indexOf(plan.name);
  const requiredTier = tiers.indexOf(flag.planGate);
  return orgTier >= requiredTier;
}

export async function getOrgFromUserId(userId: string): Promise<string | null> {
  const member = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
  });
  return member?.organization.id ?? null;
}

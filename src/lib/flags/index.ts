import { prisma } from "@/lib/db";

export async function checkFeatureFlag(
  key: string,
  orgId: string,
  planName: string,
): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({ where: { key } });
  if (!flag) return false;
  if (!flag.enabled) return false;

  // Rollout percentage gate
  if (flag.rolloutPercent < 100) {
    const hash = hashString(`${orgId}:${key}`);
    if ((hash % 100) >= flag.rolloutPercent) return false;
  }

  // Plan gate
  if (flag.planGate) {
    const planNames = ["free", "croissance"];
    const planIndex = planNames.indexOf(planName);
    const gateIndex = planNames.indexOf(flag.planGate);
    if (planIndex < gateIndex) return false;
  }

  return true;
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash);
}

import { prisma } from "@/lib/db";

export async function addToBlacklist(orgId: string, phone: string): Promise<void> {
  // Mark all existing orders from this phone as high risk
  await prisma.order.updateMany({
    where: { organizationId: orgId, buyerPhone: phone, deletedAt: null },
    data: { riskLevel: "high", trustScore: 0 },
  });
}

export async function removeFromBlacklist(orgId: string, phone: string): Promise<void> {
  // Re-score orders from this phone
  await prisma.order.updateMany({
    where: { organizationId: orgId, buyerPhone: phone, riskLevel: "high", deletedAt: null },
    data: { riskLevel: "medium", trustScore: 50 },
  });
}

export async function isBlacklisted(orgId: string, phone: string): Promise<boolean> {
  const count = await prisma.order.count({
    where: { organizationId: orgId, buyerPhone: phone, riskLevel: "high", deletedAt: null },
  });
  return count > 0;
}

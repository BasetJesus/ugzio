import { prisma } from "@/lib/db";
import { handleIncomingMedia } from "@/lib/ugc/service";

export async function processIncomingMedia(buyerPhone: string, mediaUrl: string, mediaType: "image" | "video") {
  await handleIncomingMedia(buyerPhone, mediaUrl, mediaType);
}

export async function getUgcItems(orgId: string) {
  const items = await prisma.ugcItem.findMany({
    where: { order: { organizationId: orgId } },
    orderBy: { createdAt: "desc" },
    include: { order: { select: { buyerName: true, buyerPhone: true } } },
    take: 50,
  });
  return items;
}

export async function getUgcCount(orgId: string): Promise<number> {
  return prisma.ugcItem.count({
    where: { order: { organizationId: orgId }, status: "received" },
  });
}

export async function getUgcStats(orgId: string) {
  const [total, received] = await Promise.all([
    prisma.ugcItem.count({ where: { order: { organizationId: orgId } } }),
    prisma.ugcItem.count({ where: { order: { organizationId: orgId }, status: "received" } }),
  ]);

  return { total, received, rate: total > 0 ? Math.round((received / total) * 100) : 0 };
}

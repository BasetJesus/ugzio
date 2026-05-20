import { prisma } from "@/lib/db";

export interface FlowPostSummary {
  id: string;
  ugcItemId: string;
  buyerName: string;
  product: string | null;
  mediaUrl: string;
  mediaType: string;
  platform: string;
  status: string;
  publishedUrl: string | null;
  scheduledFor: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export async function getPublishedPosts(orgId: string): Promise<FlowPostSummary[]> {
  try {
    const posts = await prisma.zioFlowPost.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        ugcItem: {
          include: {
            order: { select: { buyerName: true, product: true } },
          },
        },
      },
    });

    return posts.map((p) => ({
      id: p.id,
      ugcItemId: p.ugcItemId,
      buyerName: p.ugcItem.order.buyerName,
      product: p.ugcItem.order.product,
      mediaUrl: p.ugcItem.mediaUrl,
      mediaType: p.ugcItem.mediaType,
      platform: p.platform,
      status: p.status,
      publishedUrl: p.publishedUrl,
      scheduledFor: p.scheduledFor?.toISOString() ?? null,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function queueRepost(
  orgId: string,
  ugcItemId: string,
  platform: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const ugcItem = await prisma.ugcItem.findFirst({
      where: { id: ugcItemId, status: "approved", order: { organizationId: orgId } },
    });
    if (!ugcItem) {
      return { success: false, error: "UGC item not found or not approved" };
    }

    await prisma.zioFlowPost.create({
      data: {
        organizationId: orgId,
        ugcItemId,
        platform,
        status: "queued",
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to queue repost" };
  }
}

export async function getFlowStats(orgId: string) {
  try {
    const [totalPublished, totalQueued, byPlatform] = await Promise.all([
      prisma.zioFlowPost.count({ where: { organizationId: orgId, status: "published" } }),
      prisma.zioFlowPost.count({ where: { organizationId: orgId, status: "queued" } }),
      prisma.zioFlowPost.groupBy({
        by: ["platform"],
        where: { organizationId: orgId },
        _count: { id: true },
      }),
    ]);

    return {
      totalPublished,
      totalQueued,
      byPlatform: byPlatform.map((g) => ({
        platform: g.platform,
        count: g._count.id,
      })),
    };
  } catch {
    return { totalPublished: 0, totalQueued: 0, byPlatform: [] };
  }
}

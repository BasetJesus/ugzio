import { prisma } from "@/lib/db";
import { handleIncomingMedia } from "@/lib/ugc/service";
import { sendText } from "@/lib/whatsapp/client";

export interface UgcItemSummary {
  id: string
  orderId: string
  buyerName: string
  buyerPhone: string
  product: string | null
  amount: number
  mediaUrl: string
  mediaType: string
  status: string
  createdAt: string
}

export interface UgcStats {
  total: number
  received: number
  approved: number
  rejected: number
  rate: number
}

export async function processIncomingMedia(buyerPhone: string, mediaUrl: string, mediaType: "image" | "video") {
  await handleIncomingMedia(buyerPhone, mediaUrl, mediaType);
}

export async function getUgcItems(orgId: string): Promise<UgcItemSummary[]> {
  try {
    const items = await prisma.ugcItem.findMany({
      where: { order: { organizationId: orgId } },
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { buyerName: true, buyerPhone: true, product: true, amount: true } },
      },
      take: 50,
    });

    return items.map((i) => ({
      id: i.id,
      orderId: i.orderId,
      buyerName: i.order.buyerName,
      buyerPhone: i.buyerPhone,
      product: i.order.product,
      amount: Number(i.order.amount),
      mediaUrl: i.mediaUrl,
      mediaType: i.mediaType,
      status: i.status,
      createdAt: i.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getUgcCount(orgId: string): Promise<number> {
  try {
    return prisma.ugcItem.count({
      where: { order: { organizationId: orgId }, status: "received" },
    });
  } catch {
    return 0;
  }
}

export async function getUgcStats(orgId: string): Promise<UgcStats> {
  try {
    const [total, received, approved, rejected] = await Promise.all([
      prisma.ugcItem.count({ where: { order: { organizationId: orgId } } }),
      prisma.ugcItem.count({ where: { order: { organizationId: orgId }, status: "received" } }),
      prisma.ugcItem.count({ where: { order: { organizationId: orgId }, status: "approved" } }),
      prisma.ugcItem.count({ where: { order: { organizationId: orgId }, status: "rejected" } }),
    ]);

    return { total, received, approved, rejected, rate: total > 0 ? Math.round((approved / total) * 100) : 0 };
  } catch {
    return { total: 0, received: 0, approved: 0, rejected: 0, rate: 0 };
  }
}

export async function approveUgcItem(orgId: string, itemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const item = await prisma.ugcItem.findFirst({
      where: { id: itemId, order: { organizationId: orgId } },
      include: {
        order: { select: { buyerName: true, buyerPhone: true, product: true } },
      },
    });
    if (!item) return { success: false, error: "UGC item not found" };

    await prisma.ugcItem.update({
      where: { id: itemId },
      data: { status: "approved" },
    });

    sendText(
      item.order.buyerPhone,
      `Merci ${item.order.buyerName}! On adore ta photo 📸✨ Elle sera bientôt partagée. Reviens nous voir pour ta prochaine commande 💜`,
    ).catch((e) => console.error("[grow] failed to send approval notification:", e));

    return { success: true };
  } catch {
    return { success: false, error: "Failed to approve item" };
  }
}

export async function rejectUgcItem(orgId: string, itemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const item = await prisma.ugcItem.findFirst({
      where: { id: itemId, order: { organizationId: orgId } },
    });
    if (!item) return { success: false, error: "UGC item not found" };

    await prisma.ugcItem.update({
      where: { id: itemId },
      data: { status: "rejected" },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to reject item" };
  }
}

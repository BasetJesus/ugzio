import { prisma } from "@/lib/db";
import { alertSeller, ugcReceivedAlert } from "@/lib/alerts/seller";

export async function handleIncomingMedia(
  buyerPhone: string,
  mediaUrl: string,
  mediaType: "image" | "video",
) {
  const order = await prisma.order.findFirst({
    where: { buyerPhone, status: { in: ["DELIVERED", "UGC_REQUESTED"] }, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!order) return;

  await prisma.ugcItem.create({
    data: {
      orderId: order.id,
      mediaUrl,
      mediaType,
      buyerPhone,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "UGC_RECEIVED" },
  });

  await alertSeller(order.organizationId, ugcReceivedAlert(order.buyerName));
}

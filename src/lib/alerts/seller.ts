import { sendText } from "@/lib/whatsapp/client";

export async function alertSeller(orgId: string, message: string) {
  const { prisma } = await import("@/lib/db");
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org?.sellerPhone) return;

  try {
    await sendText(org.sellerPhone, message);
  } catch (err) {
    console.error(`[SellerAlert] Failed to send to ${org.sellerPhone}:`, err);
  }
}

export function cancelAlert(buyerName: string, product: string) {
  return `❌ ${buyerName} a annulé sa commande ${product}`;
}

export function ugcReceivedAlert(buyerName: string) {
  return `📸 Nouveau UGC de ${buyerName}! Voir dans le dashboard.`;
}

export function refusedAlert(buyerName: string) {
  return `⚠️ Livraison refusée par ${buyerName}. RTS score updated.`;
}

export function highRiskAlert(buyerName: string, score: number) {
  return `🔴 Commande à risque: ${buyerName}, score ${score}. Appeler avant envoi?`;
}

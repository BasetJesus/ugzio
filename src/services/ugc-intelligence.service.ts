import { prisma } from "@/lib/db"

export interface UgcProbabilityScore {
  score: number
  label: "high" | "medium" | "low"
  factors: UgcFactor[]
  recommendedRequestType: UgcRequestType
}

export type UgcRequestType = "photo_review" | "instagram_story" | "tiktok_unboxing" | "written_testimonial" | "whatsapp_feedback"

export interface UgcFactor {
  name: string
  impact: "positive" | "negative" | "neutral"
  detail: string
}

const UGC_REQUEST_TYPES: UgcRequestType[] = [
  "photo_review",
  "instagram_story",
  "tiktok_unboxing",
  "written_testimonial",
  "whatsapp_feedback",
]

export async function calculateUgcProbability(
  orgId: string,
  orderId: string,
): Promise<UgcProbabilityScore> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
    })
    if (!order) return emptyScore("Order not found")

    const buyerOrders = await prisma.order.findMany({
      where: { organizationId: orgId, buyerPhone: order.buyerPhone, deletedAt: null },
      orderBy: { createdAt: "desc" },
    })

    const previousOrders = buyerOrders.filter((o) => o.id !== orderId)
    const deliveredCount = buyerOrders.filter(
      (o) => o.status === "DELIVERED" || o.status === "UGC_REQUESTED" || o.status === "UGC_RECEIVED",
    ).length

    const existingUgc = await prisma.ugcItem.count({
      where: { order: { organizationId: orgId, buyerPhone: order.buyerPhone } },
    })

    const factors: UgcFactor[] = []
    let score = 50

    if (order.trustScore >= 70) {
      score += 20
      factors.push({ name: "High trust", impact: "positive", detail: "Trust score of " + order.trustScore + " indicates reliable buyer" })
    } else if (order.trustScore >= 40) {
      score += 5
      factors.push({ name: "Moderate trust", impact: "neutral", detail: "Trust score of " + order.trustScore })
    } else {
      score -= 15
      factors.push({ name: "Low trust", impact: "negative", detail: "Trust score of " + order.trustScore })
    }

    if (order.confirmStatus === "confirmed" || order.status === "BUYER_CONFIRMED") {
      score += 15
      factors.push({ name: "Fast confirmation", impact: "positive", detail: "Buyer confirmed quickly" })
    }

    if (previousOrders.length >= 3) {
      score += 15
      factors.push({ name: "Repeat buyer", impact: "positive", detail: previousOrders.length + " previous orders" })
    } else if (previousOrders.length >= 1) {
      score += 5
      factors.push({ name: "Returning buyer", impact: "neutral", detail: previousOrders.length + " previous orders" })
    }

    if (order.status === "DELIVERED" || order.status === "UGC_REQUESTED" || order.status === "UGC_RECEIVED") {
      score += 10
      factors.push({ name: "Successful delivery", impact: "positive", detail: "Order was successfully delivered" })
    }

    if (Number(order.amount) >= 100) {
      score += 5
      factors.push({ name: "High order value", impact: "positive", detail: Number(order.amount).toFixed(0) + " TND order" })
    }

    if (existingUgc > 0) {
      score += 10
      factors.push({ name: "Previous UGC", impact: "positive", detail: existingUgc + " previous UGC submissions" })
    }

    const clampedScore = Math.max(0, Math.min(100, score))
    const label = clampedScore >= 70 ? "high" : clampedScore >= 40 ? "medium" : "low"
    const recommendedRequestType = recommendType(clampedScore, order.amount, previousOrders.length)

    return {
      score: clampedScore,
      label,
      factors,
      recommendedRequestType,
    }
  } catch {
    return emptyScore("Error calculating score")
  }
}

export async function getUgcIntelligence(
  orgId: string,
  orderId: string,
): Promise<UgcProbabilityScore & { orderAmount: number; buyerName: string }> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
    select: { amount: true, buyerName: true },
  })

  const score = await calculateUgcProbability(orgId, orderId)

  return {
    ...score,
    orderAmount: Number(order?.amount ?? 0),
    buyerName: order?.buyerName ?? "Unknown",
  }
}

export async function getUgcOpportunities(
  orgId: string,
  limit: number = 5,
): Promise<Array<{ orderId: string; buyerName: string; amount: number; score: number; label: string; requestType: UgcRequestType }>> {
  try {
    const deliveredOrders = await prisma.order.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        status: { in: ["DELIVERED", "UGC_REQUESTED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, buyerName: true, amount: true },
    })

    const ugcOrderIds = new Set(
      (await prisma.ugcItem.findMany({
        where: { order: { organizationId: orgId } },
        select: { orderId: true },
      })).map((u) => u.orderId),
    )

    const results: Array<{ orderId: string; buyerName: string; amount: number; score: number; label: string; requestType: UgcRequestType }> = []
    for (const order of deliveredOrders) {
      if (ugcOrderIds.has(order.id)) continue
      if (results.length >= limit) break
      const prob = await calculateUgcProbability(orgId, order.id)
      results.push({
        orderId: order.id,
        buyerName: order.buyerName,
        amount: Number(order.amount),
        score: prob.score,
        label: prob.label,
        requestType: prob.recommendedRequestType,
      })
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  } catch {
    return []
  }
}

const UGC_MESSAGE_TEMPLATES: Record<UgcRequestType, (name: string, product?: string) => string> = {
  photo_review: (name, product) =>
    "Hey " + name + "! 🎉 Tu as reçu ton " + (product ?? "commande") + " — ça t'a plu ? Envoie-nous une photo et on te crédite 15 TND sur ta prochaine commande 🎁",
  instagram_story: (name, product) =>
    "Salut " + name + " 🙌 On adorerait voir ton " + (product ?? "produit") + " en action ! Tagge-nous dans ta story Instagram et reçois 15 TND de réduction 🎁",
  tiktok_unboxing: (name, product) =>
    "Hey " + name + "! Tu veux participer à notre défi unboxing ? 🎬 Filme ton déballage du " + (product ?? "produit") + ", poste-le sur TikTok et gagne 20 TND 🎉",
  written_testimonial: (name, product) =>
    name + "! On a adoré te compter parmi nos clients. Tu peux nous laisser un petit mot sur ce que tu as pensé du " + (product ?? "produit") + " ? 📝✨",
  whatsapp_feedback: (name, product) =>
    "Salam " + name + "! Comment s'est passée la réception du " + (product ?? "colis") + " ? Un petit feedback nous ferait plaisir 💬🙏",
}

export function getUgcMessage(requestType: UgcRequestType, buyerName: string, product?: string): string {
  const template = UGC_MESSAGE_TEMPLATES[requestType]
  return template(buyerName, product)
}

export function getUgcRequestTypes(): UgcRequestType[] {
  return [...UGC_REQUEST_TYPES]
}

function recommendType(score: number, amount: number, previousOrders: number): UgcRequestType {
  if (score >= 80 && amount >= 200) return "tiktok_unboxing"
  if (score >= 70 && previousOrders >= 2) return "instagram_story"
  if (score >= 60) return "photo_review"
  if (score >= 40) return "written_testimonial"
  return "whatsapp_feedback"
}

function emptyScore(reason: string): UgcProbabilityScore {
  return {
    score: 0,
    label: "low",
    factors: [{ name: "Error", impact: "neutral", detail: reason }],
    recommendedRequestType: "whatsapp_feedback",
  }
}

import { prisma } from "@/lib/db";
import { transitionOrderStatus } from "./order.service";
import { recordJourneyEvent } from "./buyer-journey.service";
import { addEvent } from "./operation-timeline.service";
import { JOURNEY_EVENT_TYPES } from "@/types/journey";
import type { OrderStatus } from "@/types/order";

export interface BuyerOrderView {
  orderId: string
  token: string
  sellerName: string
  sellerPhone: string | null
  product: string | null
  amount: number
  currency: string
  buyerName: string
  buyerPhone: string
  status: string
  phase: "pre_confirmation" | "confirmed" | "shipped" | "delivered" | "completed"
  trustScore: number
  estimatedDeliveryDays: number
  createdAt: string
  brandDescription: string | null
  socialLinks: { instagram?: string; facebook?: string; tiktok?: string }
}

export type BuyerAction = "confirm" | "question"

export async function getBuyerOrder(token: string): Promise<BuyerOrderView | null> {
  try {
    const order = await prisma.order.findFirst({
      where: { token, deletedAt: null },
      include: {
        organization: {
          select: { name: true, sellerName: true, sellerPhone: true, brandDescription: true, socialLinks: true, deliveryProviders: { take: 1 } },
        },
      },
    })
    if (!order) return null

    const phase = derivePhase(order.status)
    const sellerName = order.organization.sellerName ?? order.organization.name
    const deliveryDays = order.organization.deliveryProviders[0]?.avgDeliveryDays ?? 3

    let socialLinks: { instagram?: string; facebook?: string; tiktok?: string } = {}
    try {
      if (order.organization.socialLinks) socialLinks = JSON.parse(order.organization.socialLinks)
    } catch {}

    return {
      orderId: order.id,
      token: order.token,
      sellerName,
      sellerPhone: order.organization.sellerPhone,
      product: order.product,
      amount: Number(order.amount),
      currency: order.currency,
      buyerName: order.buyerName,
      buyerPhone: order.buyerPhone,
      status: order.status,
      phase,
      trustScore: order.trustScore,
      estimatedDeliveryDays: deliveryDays,
      createdAt: order.createdAt.toISOString(),
      brandDescription: order.organization.brandDescription,
      socialLinks,
    }
  } catch {
    return null
  }
}

export async function buyerConfirmOrder(
  token: string,
  action: BuyerAction,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findFirst({
      where: { token, deletedAt: null },
    })
    if (!order) return { success: false }

    if (action === "confirm") {
      const transitioned = await transitionOrderStatus(order.organizationId, order.id, "BUYER_CONFIRMED" as OrderStatus)
      if (!transitioned) return { success: false }

      await prisma.order.update({
        where: { id: order.id },
        data: { confirmStatus: "confirmed" },
      })
      await recordJourneyEvent(order.organizationId, order.id, JOURNEY_EVENT_TYPES.BUYER_CONFIRMED, {
        channel: "buyer_page",
        source: "self_service",
      })
      await addEvent(order.organizationId, order.id, "buyer.confirmed", "buyer", {
        method: "self_service",
        orderAmount: Number(order.amount),
      })
    }

    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function submitBuyerFeedback(
  token: string,
  satisfaction: number,
  note?: string,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findFirst({
      where: { token, deletedAt: null },
    })
    if (!order) return { success: false }

    await addEvent(order.organizationId, order.id, "buyer.responded", "buyer", {
      satisfaction,
      note: note ?? null,
      orderAmount: Number(order.amount),
      feedbackChannel: "buyer_page",
    })

    await recordJourneyEvent(order.organizationId, order.id, JOURNEY_EVENT_TYPES.BUYER_RESPONDED, {
      satisfaction,
      channel: "buyer_page",
    })

    return { success: true }
  } catch {
    return { success: false }
  }
}

export function derivePhase(status: string): BuyerOrderView["phase"] {
  switch (status) {
    case "CREATED":
    case "PRE_SHIPPING_CONFIRM_SENT":
    case "PENDING_RESCHEDULE":
      return "pre_confirmation"
    case "BUYER_CONFIRMED":
      return "confirmed"
    case "SHIPPED":
      return "shipped"
    case "DELIVERED":
      return "delivered"
    case "UGC_REQUESTED":
    case "UGC_RECEIVED":
      return "completed"
    default:
      return "pre_confirmation"
  }
}

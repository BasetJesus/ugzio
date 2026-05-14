import { prisma } from "@/lib/db";
import { transitionOrderStatus } from "./order.service";
import { recordJourneyEvent } from "./buyer-journey.service";
import { addEvent } from "./operation-timeline.service";
import { JOURNEY_EVENT_TYPES } from "@/types/journey";
import type { OrderStatus } from "@/types/order";

export interface BuyerOrderView {
  orderId: string
  sellerName: string
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
}

export type BuyerAction = "confirm" | "question"

export async function getBuyerOrder(orderId: string): Promise<BuyerOrderView | null> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
      include: {
        organization: {
          select: { name: true, sellerName: true, deliveryProviders: { take: 1 } },
        },
      },
    })
    if (!order) return null

    const phase = derivePhase(order.status)
    const sellerName = order.organization.sellerName ?? order.organization.name
    const deliveryDays = order.organization.deliveryProviders[0]?.avgDeliveryDays ?? 3

    return {
      orderId: order.id,
      sellerName,
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
    }
  } catch {
    return null
  }
}

export async function buyerConfirmOrder(
  orderId: string,
  action: BuyerAction,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
    })
    if (!order) return { success: false }

    if (action === "confirm") {
      await transitionOrderStatus(order.organizationId, orderId, "BUYER_CONFIRMED" as OrderStatus)
      await prisma.order.update({
        where: { id: orderId },
        data: { confirmStatus: "confirmed" },
      })
      await recordJourneyEvent(order.organizationId, orderId, JOURNEY_EVENT_TYPES.BUYER_CONFIRMED, {
        channel: "buyer_page",
        source: "self_service",
      })
      await addEvent(order.organizationId, orderId, "confirmed", "buyer", {
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
  orderId: string,
  satisfaction: number,
  note?: string,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
    })
    if (!order) return { success: false }

    await addEvent(order.organizationId, orderId, "operator_note", "buyer", {
      satisfaction,
      note: note ?? null,
      orderAmount: Number(order.amount),
      feedbackChannel: "buyer_page",
    })

    await recordJourneyEvent(order.organizationId, orderId, JOURNEY_EVENT_TYPES.BUYER_RESPONDED, {
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

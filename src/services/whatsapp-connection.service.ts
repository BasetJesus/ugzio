import { prisma } from "@/lib/db"
import type { WhatsAppConnectionState, ConnectionStatus } from "@/types/whatsapp"

export async function getConnectionStatus(orgId: string): Promise<WhatsAppConnectionState> {
  try {
    const conn = await prisma.whatsAppConnection.findUnique({ where: { organizationId: orgId } })
    if (!conn) {
      return { status: "disconnected" }
    }
    return {
      status: conn.status as ConnectionStatus,
      phoneNumber: conn.phoneNumber ?? undefined,
      connectedAt: conn.connectedAt?.toISOString(),
      expiresAt: conn.expiresAt?.toISOString(),
    }
  } catch {
    return { status: "disconnected" }
  }
}

export async function updateConnectionStatus(
  orgId: string,
  data: { status: ConnectionStatus; phoneNumber?: string; expiresAt?: Date }
): Promise<{ success: boolean }> {
  try {
    const existing = await prisma.whatsAppConnection.findUnique({ where: { organizationId: orgId } })

    if (existing) {
      await prisma.whatsAppConnection.update({
        where: { organizationId: orgId },
        data: {
          status: data.status,
          phoneNumber: data.phoneNumber,
          connectedAt: data.status === "connected" ? new Date() : undefined,
          expiresAt: data.expiresAt,
        },
      })
    } else {
      await prisma.whatsAppConnection.create({
        data: {
          organizationId: orgId,
          status: data.status,
          phoneNumber: data.phoneNumber,
          connectedAt: data.status === "connected" ? new Date() : undefined,
          expiresAt: data.expiresAt,
        },
      })
    }

    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function getSessionStatus(orgId: string, orderId: string): Promise<"sent" | "opened" | "replied" | "ignored"> {
  try {
    const [replied, opened, sent] = await Promise.all([
      prisma.operationEvent.findFirst({ where: { organizationId: orgId, orderId, type: "buyer_replied" } }),
      prisma.operationEvent.findFirst({ where: { organizationId: orgId, orderId, type: "whatsapp_opened" } }),
      prisma.message.count({ where: { conversation: { organizationId: orgId, orderId } } }),
    ])

    if (replied) return "replied"
    if (opened) return "opened"
    if (sent > 0) return "sent"
    return "ignored"
  } catch {
    return "ignored"
  }
}

export async function getMessageSessions(orgId: string, limit: number = 10): Promise<Array<{
  orderId: string
  buyerName: string
  buyerPhone: string
  status: "sent" | "opened" | "replied" | "ignored"
  messageCount: number
  lastActivityAt: string
  orderAmount: number
}>> {
  try {
    const orders = await prisma.order.findMany({
      where: { organizationId: orgId, deletedAt: null, conversations: { some: {} } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        conversations: {
          include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
        },
      },
    })

    const sessions = await Promise.all(orders.map(async (order) => {
      const status = await getSessionStatus(orgId, order.id)
      const [lastMsg] = order.conversations[0]?.messages ?? []
      const msgCountResult = await prisma.message.count({
        where: { conversation: { organizationId: orgId, orderId: order.id } },
      })
      return {
        orderId: order.id,
        buyerName: order.buyerName,
        buyerPhone: order.buyerPhone,
        status,
        messageCount: msgCountResult,
        lastActivityAt: (lastMsg?.createdAt ?? order.createdAt).toISOString(),
        orderAmount: order.amount,
      }
    }))

    return sessions
  } catch {
    return []
  }
}

export async function recordSessionEvent(
  orgId: string,
  orderId: string,
  eventType: "message_sent" | "whatsapp_opened" | "buyer_replied"
): Promise<{ success: boolean }> {
  try {
    await prisma.operationEvent.create({
      data: {
        organizationId: orgId,
        orderId,
        type: eventType,
        actorType: eventType === "message_sent" ? "operator" : "buyer",
      },
    })
    return { success: true }
  } catch {
    return { success: false }
  }
}

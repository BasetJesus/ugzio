import { prisma } from "@/lib/db"

export type OperationEventType = "message_sent" | "whatsapp_opened" | "whatsapp_message_sent" | "buyer_replied" | "buyer_confirmed" | "confirmed" | "unreachable" | "delayed_request" | "cancelled" | "retry_scheduled" | "operator_note" | "sequence_selected" | "ugc_request_sent" | "ugc_received" | "delivery_completed" | "customer_story_shared" | "review_received"

export type ActorType = "system" | "operator" | "buyer"

export interface OperationEventRecord {
  id: string
  orderId: string
  type: OperationEventType
  metadata: Record<string, unknown> | null
  actorType: ActorType
  createdAt: string
}

export async function addEvent(
  orgId: string,
  orderId: string,
  type: OperationEventType,
  actorType: ActorType,
  metadata?: Record<string, unknown> | null,
): Promise<{ success: boolean }> {
  try {
    await prisma.operationEvent.create({
      data: {
        organizationId: orgId,
        orderId,
        type,
        metadata: metadata ? JSON.stringify(metadata) : null,
        actorType,
      },
    })
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function getOrderTimeline(
  orgId: string,
  orderId: string,
): Promise<OperationEventRecord[]> {
  try {
    const events = await prisma.operationEvent.findMany({
      where: { organizationId: orgId, orderId },
      orderBy: { createdAt: "asc" },
    })

    return events.map((e) => ({
      id: e.id,
      orderId: e.orderId,
      type: e.type as OperationEventType,
      metadata: e.metadata ? safeParseJson(e.metadata) : null,
      actorType: e.actorType as ActorType,
      createdAt: e.createdAt.toISOString(),
    }))
  } catch {
    return []
  }
}

export async function getRecentActivity(
  orgId: string,
  limit: number = 10,
): Promise<OperationEventRecord[]> {
  try {
    const events = await prisma.operationEvent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return events.map((e) => ({
      id: e.id,
      orderId: e.orderId,
      type: e.type as OperationEventType,
      metadata: e.metadata ? safeParseJson(e.metadata) : null,
      actorType: e.actorType as ActorType,
      createdAt: e.createdAt.toISOString(),
    }))
  } catch {
    return []
  }
}

function safeParseJson(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

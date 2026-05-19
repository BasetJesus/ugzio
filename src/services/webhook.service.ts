import { prisma } from "@/lib/db";
import { enqueueWebhookJob } from "@/lib/events/queues";

export async function logWebhookEvent(data: {
  eventId: string;
  provider: string;
  eventType: string;
  payload: string;
  signature: string;
}) {
  try {
    const existing = await prisma.webhookLog.findUnique({
      where: { eventId: data.eventId },
    });
    if (existing) return { logged: false } as const;

    await prisma.webhookLog.create({
      data: {
        provider: data.provider,
        eventType: data.eventType,
        eventId: data.eventId,
        payload: data.payload,
        signature: data.signature,
        processed: false,
      },
    });

    return { logged: true } as const;
  } catch (e) {
    console.error("[webhook.service] logWebhookEvent failed:", e);
    return { logged: false } as const;
  }
}

export type WebhookMessageType = "MESSAGE_RECEIVED" | "STATUS_UPDATE";

export async function processWebhookMessages(entries: any[], signature: string) {
  try {
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value;
        if (!value) continue;
        const metadata = value.metadata;
        const phoneNumberId = metadata?.phone_number_id;

        if (value.messages) {
          for (const message of value.messages) {
            const result = await logWebhookEvent({
              provider: "meta",
              eventType: message.type || "unknown",
              eventId: message.id,
              payload: JSON.stringify({ message, phoneNumberId }),
              signature,
            });

            if (result.logged) {
              await enqueueWebhookJob("MESSAGE_RECEIVED", {
                webhookLogId: message.id,
                message,
                phoneNumberId,
              });
            }
          }
        }

        if (value.statuses) {
          for (const status of value.statuses) {
            const result = await logWebhookEvent({
              provider: "meta",
              eventType: `status:${status.status}`,
              eventId: status.id,
              payload: JSON.stringify(status),
              signature,
            });

            if (result.logged) {
              await enqueueWebhookJob("STATUS_UPDATE", {
                webhookLogId: status.id,
                status,
              });
            }
          }
        }
      }
    }
    return { success: true as const };
  } catch (e) {
    console.error("[webhook.service] processWebhookMessages failed:", e);
    return { success: false as const };
  }
}

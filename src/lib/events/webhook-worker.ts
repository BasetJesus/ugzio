import { Worker } from "bullmq";
import { redis } from "./queues";
import { prisma } from "@/lib/db";
import { handleConfirmButton } from "@/lib/zioconfirm/service";
import { handleIncomingMedia } from "@/lib/ugc/service";

async function processMessage(message: Record<string, unknown>, phoneNumberId?: string) {
  const type = message.type as string;
  const from = message.from as string;

  switch (type) {
    case "interactive": {
      const interactive = message.interactive as Record<string, unknown> | undefined;
      const buttonReply = interactive?.button_reply as Record<string, unknown> | undefined;
      const buttonId = buttonReply?.id as string;
      if (buttonId && from) {
        const order = await prisma.order.findFirst({
          where: { buyerPhone: from, status: "PRE_SHIPPING_CONFIRM_SENT", deletedAt: null },
          orderBy: { createdAt: "desc" },
        });
        if (order) {
          await handleConfirmButton(order.id, buttonId);
        }
      }
      break;
    }

    case "button": {
      const buttonPayload = message.payload as Record<string, unknown> | undefined;
      const buttonId = buttonPayload?.id as string;
      if (buttonId && from) {
        const order = await prisma.order.findFirst({
          where: { buyerPhone: from, status: "PRE_SHIPPING_CONFIRM_SENT", deletedAt: null },
          orderBy: { createdAt: "desc" },
        });
        if (order) {
          await handleConfirmButton(order.id, buttonId);
        }
      }
      break;
    }

    case "image":
    case "video": {
      const mediaObj = message[type] as Record<string, unknown> | undefined;
      const mediaId = mediaObj?.id as string;
      if (mediaId && from) {
        const mediaUrl = `https://graph.facebook.com/v22.0/${mediaId}`;
        await handleIncomingMedia(from, mediaUrl, type as "image" | "video");
      }
      break;
    }

    case "text": {
      const textObj = message.text as Record<string, unknown> | undefined;
      const textBody = textObj?.body as string;
      console.log(`[WebhookWorker] Text from ${from}: ${textBody}`, phoneNumberId ? `(phone: ${phoneNumberId})` : "");
      break;
    }
  }
}

async function processStatusUpdate(status: Record<string, unknown>) {
  const statusType = status.status as string;
  const messageId = status.id as string;

  await prisma.webhookLog.updateMany({
    where: { eventId: messageId },
    data: { processed: true },
  });

  console.log(`[WebhookWorker] Status: ${statusType} for msg ${messageId}`);
}

export function startWebhookWorker() {
  const worker = new Worker(
    "webhook-processing",
    async (job) => {
      switch (job.name) {
        case "MESSAGE_RECEIVED": {
          const { message, phoneNumberId } = job.data as {
            message: Record<string, unknown>;
            phoneNumberId?: string;
          };
          await processMessage(message, phoneNumberId);

          await prisma.webhookLog.updateMany({
            where: { eventId: message.id as string },
            data: { processed: true },
          });
          break;
        }

        case "STATUS_UPDATE": {
          const { status } = job.data as { status: Record<string, unknown> };
          await processStatusUpdate(status);
          break;
        }
      }
    },
    { connection: redis },
  );

  worker.on("completed", (job) => console.log(`[WebhookWorker] Job ${job.id} completed`));
  worker.on("failed", (job, err) => console.error(`[WebhookWorker] Job ${job?.id} failed:`, err));

  return worker;
}

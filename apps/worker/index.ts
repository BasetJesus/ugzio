import { Worker } from "bullmq";
import IORedis from "ioredis";
import { startWebhookWorker } from "@/lib/events/webhook-worker";
import { executeTimelineMessage } from "@/lib/zioconfirm/service";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// ── Critical events worker ──

const criticalWorker = new Worker(
  "critical-events",
  async (job) => {
    console.log(`[Worker] Processing ${job.name}:`, job.data);

    switch (job.name) {
      case "ORDER_CREATED":
        try {
          const pythonUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
          await fetch(`${pythonUrl}/consumers/order-created`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(job.data),
            signal: AbortSignal.timeout(5000),
          });
        } catch (err) {
          console.error("[Worker] Python unreachable, feature capture deferred:", err);
        }
        break;
      default:
        console.log("[Worker] Unknown event:", job.name);
    }
  },
  { connection: redis },
);

criticalWorker.on("completed", (job) => console.log(`[Worker] Critical ${job.id} completed`));
criticalWorker.on("failed", (job, err) => console.error(`[Worker] Critical ${job?.id} failed:`, err));

// ── Scheduled messages worker ──

const messageWorker = new Worker(
  "scheduled-messages",
  async (job) => {
    console.log(`[MessageWorker] Processing ${job.name}:`, job.data);
    const data = job.data as Record<string, unknown>;
    const orderId = data.orderId as string;
    await executeTimelineMessage(job.name, orderId, data);
  },
  { connection: redis },
);

messageWorker.on("completed", (job) => console.log(`[MessageWorker] Job ${job.id} completed`));
messageWorker.on("failed", (job, err) => console.error(`[MessageWorker] Job ${job?.id} failed:`, err));

// ── WhatsApp outbound worker ──

const whatsappWorker = new Worker(
  "whatsapp-outbound",
  async (job) => {
    console.log(`[WhatsAppWorker] Sending message:`, job.data);
    const { orgId, to, type, content } = job.data as {
      orgId: string;
      to: string;
      type: "text" | "interactive" | "media";
      content: unknown;
    };

    let creds: { phoneNumberId: string; accessToken: string } | undefined;

    if (orgId) {
      const { getWhatsAppCreds } = await import("@/services/whatsapp-connection.service");
      const orgCreds = await getWhatsAppCreds(orgId);
      if (orgCreds) creds = orgCreds;
    }

    const { sendText, sendButtons, sendMedia } = await import("@/lib/whatsapp/client");

    switch (type) {
      case "text":
        await sendText(to, (content as { body: string }).body, creds);
        break;
      case "interactive":
        await sendButtons(
          to,
          (content as { body: string; buttons: { id: string; title: string }[] }).body,
          (content as { buttons: { id: string; title: string }[] }).buttons,
          creds,
        );
        break;
      case "media":
        await sendMedia(
          to,
          (content as { url: string }).url,
          (content as { mediaType: "image" | "video" }).mediaType,
          creds,
        );
        break;
    }
  },
  { connection: redis },
);

whatsappWorker.on("completed", (job) => console.log(`[WhatsAppWorker] Job ${job.id} completed`));
whatsappWorker.on("failed", (job, err) => console.error(`[WhatsAppWorker] Job ${job?.id} failed:`, err));

// ── Start webhook worker ──

const webhookWorker = startWebhookWorker();

console.log("[Worker] All workers started");

// Graceful shutdown
async function shutdown() {
  await criticalWorker.close();
  await messageWorker.close();
  await whatsappWorker.close();
  await webhookWorker.close();
  await redis.quit();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

import { Queue } from "bullmq";
import IORedis from "ioredis";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// ── CRITICAL events → BullMQ (durable) ──

export const criticalQueue = new Queue("critical-events", {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: false,
  },
});

export type CriticalEventType =
  | "ORDER_CREATED"
  | "DELIVERY_FAILED"
  | "VERIFICATION_CONFIRMED";

export async function emitCritical(type: CriticalEventType, payload: unknown) {
  await criticalQueue.add(type, payload, {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: false,
  });
}

// ── Scheduled messages → BullMQ (delayed) ──

export const messageQueue = new Queue("scheduled-messages", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "fixed", delay: 30000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export type MessageEventType =
  | "ANTICIPATION"
  | "SOCIAL_PROOF"
  | "VISUAL_OWNERSHIP"
  | "PRE_DELIVERY_CONFIRM"
  | "D3_UGC_ASK";

export async function scheduleMessage(
  type: MessageEventType,
  payload: unknown,
  delayMs: number,
) {
  await messageQueue.add(type, payload, {
    delay: delayMs,
    attempts: 3,
    backoff: { type: "fixed", delay: 30000 },
    removeOnComplete: true,
    removeOnFail: false,
  });
}

// ── Webhook processing queue ──

export const webhookQueue = new Queue("webhook-processing", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "fixed", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export type WebhookJobType = "MESSAGE_RECEIVED" | "STATUS_UPDATE";

export async function enqueueWebhookJob(type: WebhookJobType, payload: unknown) {
  await webhookQueue.add(type, payload, {
    attempts: 3,
    backoff: { type: "fixed", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  });
}

// ── WhatsApp outbound queue ──

export const whatsappQueue = new Queue("whatsapp-outbound", {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export async function sendWhatsApp(payload: {
  to: string;
  type: "text" | "interactive" | "media";
  content: unknown;
}) {
  await whatsappQueue.add("SEND_WHATSAPP", payload, {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  });
}

// ── Ephemeral signals → Redis Pub/Sub (dashboard refresh etc.) ──

export async function emitEphemeral(channel: string, payload: unknown) {
  await redis.publish(channel, JSON.stringify(payload));
}

export { redis };

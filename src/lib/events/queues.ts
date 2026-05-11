import { Queue, Worker } from "bullmq";
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

// ── Ephemeral signals → Redis Pub/Sub (dashboard refresh etc.) ──

export async function emitEphemeral(channel: string, payload: unknown) {
  await redis.publish(channel, JSON.stringify(payload));
}

export { redis };

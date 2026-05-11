import { Worker } from "bullmq";
import IORedis from "ioredis";

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "critical-events",
  async (job) => {
    console.log(`[Worker] Processing ${job.name}:`, job.data);

    switch (job.name) {
      case "ORDER_CREATED":
        // Forward to Python service for feature extraction
        try {
          await fetch("http://localhost:8000/consumers/order-created", {
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

worker.on("completed", (job) => console.log(`[Worker] Job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`[Worker] Job ${job?.id} failed:`, err));

console.log("[Worker] BullMQ worker started");

import IORedis from "ioredis";

export function createRedisClient(): IORedis {
  return new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    keepAlive: 30000,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 10) return null;
      return Math.min(times * 200, 10000);
    },
    reconnectOnError(err) {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) return true;
      return false;
    },
  });
}

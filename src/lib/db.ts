import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  client
    .$connect()
    .then(() => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[db] Prisma connected");
      }
    })
    .catch((e) => {
      console.error("[db] PrismaClient initialization failed:", e.message);
      console.error("[db] Check that DATABASE_URL is set and the database is reachable.");
    });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

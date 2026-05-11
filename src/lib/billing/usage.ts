import { prisma } from "@/lib/db";

export async function incrementOrdersProcessed(orgId: string): Promise<void> {
  await prisma.usageMeter.updateMany({
    where: { organizationId: orgId, periodStart: { lte: new Date() }, periodEnd: { gte: new Date() } },
    data: { ordersProcessed: { increment: 1 } },
  });
}

export async function incrementAiTokens(orgId: string, tokens: number): Promise<void> {
  await prisma.usageMeter.updateMany({
    where: { organizationId: orgId, periodStart: { lte: new Date() }, periodEnd: { gte: new Date() } },
    data: { aiTokensUsed: { increment: tokens } },
  });
}

export async function incrementVerifications(orgId: string): Promise<void> {
  await prisma.usageMeter.updateMany({
    where: { organizationId: orgId, periodStart: { lte: new Date() }, periodEnd: { gte: new Date() } },
    data: { verificationsSent: { increment: 1 } },
  });
}

import { prisma } from "@/lib/db";
import { createHash } from "node:crypto";

function hashPhone(phone: string): string {
  return createHash("sha256").update(phone.trim()).digest("hex");
}

export async function reportToZioGuard(orgId: string, phone: string) {
  try {
    const phoneHash = hashPhone(phone);

    const existing = await prisma.zioGuardEntry.findUnique({
      where: { phoneHash },
    });

    if (existing) {
      const alreadyFlaggedByOrg = await prisma.order.count({
        where: { organizationId: orgId, buyerPhone: phone, riskLevel: "high", deletedAt: null },
      });

      if (alreadyFlaggedByOrg === 0) {
        await prisma.zioGuardEntry.update({
          where: { phoneHash },
          data: { flagCount: existing.flagCount + 1 },
        });
      }
    } else {
      await prisma.zioGuardEntry.create({
        data: { phoneHash, flagCount: 1 },
      });
    }

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function checkZioGuard(phone: string): Promise<{
  flagged: boolean;
  flagCount: number;
}> {
  try {
    const phoneHash = hashPhone(phone);
    const entry = await prisma.zioGuardEntry.findUnique({
      where: { phoneHash },
    });

    if (!entry) return { flagged: false, flagCount: 0 };

    return {
      flagged: entry.flagCount >= 1,
      flagCount: entry.flagCount,
    };
  } catch {
    return { flagged: false, flagCount: 0 };
  }
}

export async function clearZioGuardEntry(phone: string) {
  try {
    const phoneHash = hashPhone(phone);
    await prisma.zioGuardEntry.delete({ where: { phoneHash } }).catch(() => {});
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getZioGuardStats() {
  try {
    const [totalEntries, multiFlagged] = await Promise.all([
      prisma.zioGuardEntry.count(),
      prisma.zioGuardEntry.count({ where: { flagCount: { gte: 2 } } }),
    ]);

    const recent = await prisma.zioGuardEntry.findMany({
      orderBy: { lastFlaggedAt: "desc" },
      take: 10,
    });

    return {
      totalEntries,
      multiFlagged,
      recentFlags: recent.map((e) => ({
        phoneHash: e.phoneHash.slice(0, 12) + "...",
        flagCount: e.flagCount,
        lastFlagged: e.lastFlaggedAt.toISOString(),
      })),
    };
  } catch {
    return { totalEntries: 0, multiFlagged: 0, recentFlags: [] };
  }
}

export async function getOrgZioGuardContributions(orgId: string) {
  try {
    const count = await prisma.order.count({
      where: { organizationId: orgId, riskLevel: "high", deletedAt: null },
    });
    return count;
  } catch {
    return 0;
  }
}

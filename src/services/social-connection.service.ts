import { prisma } from "@/lib/db";

export interface SocialConnectionSummary {
  id: string
  platform: string
  accountId: string
  accountName: string | null
  accountPicture: string | null
  followersCount: number | null
  connectedAt: string | null
}

export async function getSocialConnections(orgId: string): Promise<SocialConnectionSummary[]> {
  try {
    const conns = await prisma.socialConnection.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
    return conns.map((c) => ({
      id: c.id,
      platform: c.platform,
      accountId: c.accountId,
      accountName: c.accountName,
      accountPicture: c.accountPicture,
      followersCount: c.followersCount,
      connectedAt: c.connectedAt?.toISOString() ?? null,
    }));
  } catch {
    return [];
  }
}

export async function saveSocialConnection(
  orgId: string,
  platform: string,
  data: {
    accountId: string
    accountName?: string
    accountPicture?: string
    followersCount?: number
    accessToken?: string
    tokenExpiresAt?: Date
  }
): Promise<{ success: boolean }> {
  try {
    await prisma.socialConnection.upsert({
      where: { organizationId_platform: { organizationId: orgId, platform } },
      update: {
        accountId: data.accountId,
        accountName: data.accountName,
        accountPicture: data.accountPicture,
        followersCount: data.followersCount,
        accessToken: data.accessToken,
        tokenExpiresAt: data.tokenExpiresAt,
        connectedAt: new Date(),
      },
      create: {
        organizationId: orgId,
        platform,
        accountId: data.accountId,
        accountName: data.accountName,
        accountPicture: data.accountPicture,
        followersCount: data.followersCount,
        accessToken: data.accessToken,
        tokenExpiresAt: data.tokenExpiresAt,
        connectedAt: new Date(),
      },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function disconnectSocialConnection(
  orgId: string,
  platform: string
): Promise<{ success: boolean }> {
  try {
    await prisma.socialConnection.delete({
      where: { organizationId_platform: { organizationId: orgId, platform } },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

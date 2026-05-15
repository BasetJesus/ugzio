import { prisma } from "@/lib/db";

export interface SellerProfile {
  brandDescription: string | null
  socialLinks: SocialLinks
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  tiktok?: string
}

export async function getSellerProfile(orgId: string): Promise<SellerProfile> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { brandDescription: true, socialLinks: true },
    });
    if (!org) return { brandDescription: null, socialLinks: {} };
    return {
      brandDescription: org.brandDescription,
      socialLinks: parseSocialLinks(org.socialLinks),
    };
  } catch {
    return { brandDescription: null, socialLinks: {} };
  }
}

export async function updateSellerProfile(
  orgId: string,
  data: { brandDescription?: string; socialLinks?: SocialLinks }
): Promise<{ success: boolean }> {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.brandDescription !== undefined) {
      updateData.brandDescription = data.brandDescription;
    }
    if (data.socialLinks !== undefined) {
      updateData.socialLinks = JSON.stringify(data.socialLinks);
    }
    await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

function parseSocialLinks(raw: string | null): SocialLinks {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as SocialLinks;
  } catch {
    return {};
  }
}

import { prisma } from "@/lib/db";
import { createOrder } from "@/services/order.service";

export interface NormalizedOrder {
  buyerName: string;
  buyerPhone: string;
  amount: number;
  product?: string;
  buyerWilaya?: string;
  buyerAddress?: string;
  currency?: string;
  externalId?: string;
  platformOrderId?: string;
}

export async function getIntegrations(orgId: string) {
  try {
    const integrations = await prisma.organizationIntegration.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
    return integrations.map((i) => ({
      id: i.id,
      platform: i.platform,
      label: i.label,
      storeUrl: i.storeUrl,
      isActive: i.isActive,
      lastSyncAt: i.lastSyncAt?.toISOString() ?? null,
      lastOrderId: i.lastOrderId,
      createdAt: i.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function saveIntegration(
  orgId: string,
  platform: string,
  data: {
    label?: string;
    apiKey?: string;
    apiSecret?: string;
    storeUrl?: string;
    webhookSecret?: string;
    settings?: string;
  },
) {
  try {
    await prisma.organizationIntegration.upsert({
      where: { organizationId_platform: { organizationId: orgId, platform } },
      update: {
        label: data.label,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
        storeUrl: data.storeUrl,
        webhookSecret: data.webhookSecret,
        settings: data.settings,
        isActive: true,
      },
      create: {
        organizationId: orgId,
        platform,
        label: data.label,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
        storeUrl: data.storeUrl,
        webhookSecret: data.webhookSecret,
        settings: data.settings,
      },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function disconnectIntegration(orgId: string, platform: string) {
  try {
    await prisma.organizationIntegration.update({
      where: { organizationId_platform: { organizationId: orgId, platform } },
      data: { isActive: false, apiKey: null, apiSecret: null },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function importExternalOrder(
  orgId: string,
  order: NormalizedOrder,
  platform: string,
) {
  try {
    const created = await createOrder(orgId, {
      buyerName: order.buyerName,
      buyerPhone: order.buyerPhone,
      amount: order.amount,
      product: order.product ?? null,
      buyerWilaya: order.buyerWilaya ?? null,
      buyerAddress: order.buyerAddress ?? null,
      currency: order.currency ?? "TND",
      source: platform,
      externalId: order.externalId ?? order.platformOrderId ?? null,
    });

    if (!created) {
      return { success: false as const, error: "Failed to create order" };
    }

    const integration = await prisma.organizationIntegration.findUnique({
      where: { organizationId_platform: { organizationId: orgId, platform } },
    });
    if (integration && order.platformOrderId) {
      await prisma.organizationIntegration.update({
        where: { id: integration.id },
        data: { lastOrderId: order.platformOrderId, lastSyncAt: new Date() },
      });
    }

    return { success: true as const, orderId: created.id };
  } catch {
    return { success: false as const, error: "Failed to import order" };
  }
}

export async function updateLastSync(orgId: string, platform: string) {
  try {
    await prisma.organizationIntegration.update({
      where: { organizationId_platform: { organizationId: orgId, platform } },
      data: { lastSyncAt: new Date() },
    });
  } catch {}
}

export async function getIntegrationCount(orgId: string): Promise<number> {
  try {
    return prisma.organizationIntegration.count({
      where: { organizationId: orgId, isActive: true },
    });
  } catch {
    return 0;
  }
}

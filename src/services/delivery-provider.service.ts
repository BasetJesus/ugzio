import { prisma } from "@/lib/db";
import { safeNumber, safeString } from "@/lib/core/safe-render";

export interface DeliveryProviderSummary {
  id: string;
  name: string;
  rtsCostPerFailure: number;
  avgDeliveryDays: number;
  contactSuccessRate: number | null;
  isDefault: boolean;
  orderCount: number;
  createdAt: string;
}

export interface DeliveryProviderCreate {
  name: string;
  rtsCostPerFailure?: number;
  avgDeliveryDays?: number;
  contactSuccessRate?: number;
}

export interface DeliveryProviderUpdate {
  name?: string;
  rtsCostPerFailure?: number;
  avgDeliveryDays?: number;
  contactSuccessRate?: number;
  isDefault?: boolean;
}

const DEFAULT_RTS_COST = 15.0;
const DEFAULT_DELIVERY_DAYS = 3;

export async function getDeliveryProviders(orgId: string): Promise<DeliveryProviderSummary[]> {
  try {
    const providers = await prisma.deliveryProvider.findMany({
      where: { organizationId: orgId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return providers.map((p) => ({
      id: p.id,
      name: p.name,
      rtsCostPerFailure: Number(p.rtsCostPerFailure),
      avgDeliveryDays: p.avgDeliveryDays,
      contactSuccessRate: p.contactSuccessRate ? Number(p.contactSuccessRate) : null,
      isDefault: p.isDefault,
      orderCount: p._count.orders,
      createdAt: p.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getDeliveryProvider(orgId: string, providerId: string): Promise<DeliveryProviderSummary | null> {
  try {
    const provider = await prisma.deliveryProvider.findFirst({
      where: { id: providerId, organizationId: orgId },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!provider) return null;

    return {
      id: provider.id,
      name: provider.name,
      rtsCostPerFailure: Number(provider.rtsCostPerFailure),
      avgDeliveryDays: provider.avgDeliveryDays,
      contactSuccessRate: provider.contactSuccessRate ? Number(provider.contactSuccessRate) : null,
      isDefault: provider.isDefault,
      orderCount: provider._count.orders,
      createdAt: provider.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getDefaultDeliveryProvider(orgId: string): Promise<DeliveryProviderSummary | null> {
  try {
    const provider = await prisma.deliveryProvider.findFirst({
      where: { organizationId: orgId, isDefault: true },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!provider) return null;

    return {
      id: provider.id,
      name: provider.name,
      rtsCostPerFailure: Number(provider.rtsCostPerFailure),
      avgDeliveryDays: provider.avgDeliveryDays,
      contactSuccessRate: provider.contactSuccessRate ? Number(provider.contactSuccessRate) : null,
      isDefault: provider.isDefault,
      orderCount: provider._count.orders,
      createdAt: provider.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function createDeliveryProvider(
  orgId: string,
  data: DeliveryProviderCreate
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const name = safeString(data.name, "").trim();
    if (!name) {
      return { success: false, error: "Provider name is required" };
    }

    const existing = await prisma.deliveryProvider.findFirst({
      where: { organizationId: orgId, name },
    });

    if (existing) {
      return { success: false, error: "A provider with this name already exists" };
    }

    const count = await prisma.deliveryProvider.count({ where: { organizationId: orgId } });

    const provider = await prisma.deliveryProvider.create({
      data: {
        organizationId: orgId,
        name,
        rtsCostPerFailure: safeNumber(data.rtsCostPerFailure, DEFAULT_RTS_COST),
        avgDeliveryDays: safeNumber(data.avgDeliveryDays, DEFAULT_DELIVERY_DAYS),
        contactSuccessRate: data.contactSuccessRate !== undefined ? Number(data.contactSuccessRate) : null,
        isDefault: count === 0,
      },
    });

    return { success: true, id: provider.id };
  } catch {
    return { success: false, error: "Failed to create delivery provider" };
  }
}

export async function updateDeliveryProvider(
  orgId: string,
  providerId: string,
  data: DeliveryProviderUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.deliveryProvider.findFirst({
      where: { id: providerId, organizationId: orgId },
    });

    if (!existing) {
      return { success: false, error: "Provider not found" };
    }

    if (data.name) {
      const name = safeString(data.name, "").trim();
      const duplicate = await prisma.deliveryProvider.findFirst({
        where: { organizationId: orgId, name, id: { not: providerId } },
      });
      if (duplicate) {
        return { success: false, error: "A provider with this name already exists" };
      }
    }

    if (data.isDefault === true) {
      await prisma.deliveryProvider.updateMany({
        where: { organizationId: orgId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = safeString(data.name, existing.name);
    if (data.rtsCostPerFailure !== undefined) updateData.rtsCostPerFailure = safeNumber(data.rtsCostPerFailure, existing.rtsCostPerFailure);
    if (data.avgDeliveryDays !== undefined) updateData.avgDeliveryDays = safeNumber(data.avgDeliveryDays, existing.avgDeliveryDays);
    if (data.contactSuccessRate !== undefined) updateData.contactSuccessRate = data.contactSuccessRate;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    await prisma.deliveryProvider.update({
      where: { id: providerId },
      data: updateData,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to update delivery provider" };
  }
}

export async function deleteDeliveryProvider(
  orgId: string,
  providerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = await prisma.deliveryProvider.findFirst({
      where: { id: providerId, organizationId: orgId },
      include: { _count: { select: { orders: true } } },
    });

    if (!provider) {
      return { success: false, error: "Provider not found" };
    }

    if (provider._count.orders > 0) {
      return { success: false, error: `Cannot delete: ${provider._count.orders} orders linked to this provider` };
    }

    const wasDefault = provider.isDefault;

    await prisma.deliveryProvider.delete({
      where: { id: providerId },
    });

    if (wasDefault) {
      const remaining = await prisma.deliveryProvider.findFirst({
        where: { organizationId: orgId },
        orderBy: { createdAt: "asc" },
      });
      if (remaining) {
        await prisma.deliveryProvider.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete delivery provider" };
  }
}

export async function getProviderRtsCost(orgId: string, providerId?: string): Promise<number> {
  try {
    let provider: { rtsCostPerFailure: number | unknown } | null = null;

    if (providerId) {
      provider = await prisma.deliveryProvider.findFirst({
        where: { id: providerId, organizationId: orgId },
        select: { rtsCostPerFailure: true },
      });
    }

    if (!provider) {
      provider = await prisma.deliveryProvider.findFirst({
        where: { organizationId: orgId, isDefault: true },
        select: { rtsCostPerFailure: true },
      });
    }

    if (provider) {
      return Number(provider.rtsCostPerFailure);
    }

    return DEFAULT_RTS_COST;
  } catch {
    return DEFAULT_RTS_COST;
  }
}

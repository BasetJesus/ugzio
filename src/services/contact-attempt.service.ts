import { prisma } from "@/lib/db";
import { safeString } from "@/lib/core/safe-render";

export type ContactMethod = "manual_call" | "whatsapp" | "sms";
export type ContactOutcome = "confirmed" | "unreachable" | "suspicious" | "no_answer" | "failed";

export interface ContactAttemptRecord {
  id: string;
  orderId: string;
  method: ContactMethod;
  outcome: ContactOutcome;
  notes: string | null;
  attemptedBy: string | null;
  mockData?: {
    messageTemplate?: string;
    deliveryStatus?: string;
    readAt?: string;
  };
  createdAt: string;
}

export interface MockContactResult {
  success: boolean;
  method: ContactMethod;
  outcome: ContactOutcome;
  messageId?: string;
  error?: string;
}

export async function attemptContact(
  orgId: string,
  orderId: string,
  method: ContactMethod,
  operator?: string,
  notes?: string
): Promise<MockContactResult> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
      select: { buyerPhone: true, buyerName: true },
    });

    if (!order) {
      return { success: false, method, outcome: "failed", error: "Order not found" };
    }

    const outcome = simulateContactOutcome(method);

    await prisma.confirmationAttempt.create({
      data: {
        order: { connect: { id: orderId } },
        method,
        outcome,
        notes: notes ?? null,
        attemptedBy: operator ?? null,
      },
    });

    return {
      success: outcome !== "failed",
      method,
      outcome,
      messageId: method === "whatsapp" ? `mock_wamid_${Date.now()}` : undefined,
    };
  } catch (e) {
    return {
      success: false,
      method,
      outcome: "failed",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

function simulateContactOutcome(method: ContactMethod): ContactOutcome {
  const roll = Math.random();

  switch (method) {
    case "whatsapp":
      if (roll < 0.55) return "confirmed";
      if (roll < 0.75) return "no_answer";
      if (roll < 0.9) return "unreachable";
      return "suspicious";

    case "sms":
      if (roll < 0.35) return "confirmed";
      if (roll < 0.65) return "no_answer";
      if (roll < 0.85) return "unreachable";
      return "suspicious";

    case "manual_call":
    default:
      if (roll < 0.65) return "confirmed";
      if (roll < 0.8) return "no_answer";
      if (roll < 0.92) return "unreachable";
      return "suspicious";
  }
}

export async function getContactHistory(
  orgId: string,
  orderId: string
): Promise<ContactAttemptRecord[]> {
  try {
    const attempts = await prisma.confirmationAttempt.findMany({
      where: {
        orderId,
        order: { organizationId: orgId },
      },
      orderBy: { createdAt: "desc" },
    });

    return attempts.map((a) => ({
      id: a.id,
      orderId: a.orderId,
      method: a.method as ContactMethod,
      outcome: a.outcome as ContactOutcome,
      notes: a.notes,
      attemptedBy: a.attemptedBy,
      createdAt: a.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function mockSendWhatsApp(
  orgId: string,
  orderId: string,
  templateType: "confirm" | "reminder" | "risk_alert" = "confirm"
): Promise<MockContactResult> {
  const templates: Record<string, string> = {
    confirm: "Bonjour {{name}}! Merci pour votre commande de {{amount}} TND. Pourriez-vous confirmer que vous êtes bien disponible pour la livraison ?",
    reminder: "Rappel : Votre commande est en attente de confirmation. Merci de nous répondre pour planifier la livraison.",
    risk_alert: "Attention : Nous avons détecté quelques éléments à vérifier pour votre commande. Pourriez-vous nous confirmer vos coordonnées ?",
  };

  return attemptContact(orgId, orderId, "whatsapp", undefined, `Template: ${templateType}`);
}

export async function mockSendSMS(
  orgId: string,
  orderId: string
): Promise<MockContactResult> {
  return attemptContact(orgId, orderId, "sms");
}

export async function mockLogManualCall(
  orgId: string,
  orderId: string,
  outcome: ContactOutcome,
  operator: string,
  notes?: string
): Promise<{ success: boolean }> {
  try {
    await prisma.confirmationAttempt.create({
      data: {
        order: { connect: { id: orderId } },
        method: "manual_call",
        outcome,
        notes: notes ?? null,
        attemptedBy: operator,
      },
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

import { prisma } from "@/lib/db";
import { addEvent } from "@/services/operation-timeline.service";

export type ContactMethod = "manual_call" | "whatsapp" | "sms";
export type ContactOutcome = "confirmed" | "unreachable" | "suspicious" | "no_answer" | "failed";

export interface ContactAttemptRecord {
  id: string;
  orderId: string;
  method: ContactMethod;
  outcome: ContactOutcome;
  notes: string | null;
  attemptedBy: string | null;
  createdAt: string;
}

export interface ContactResult {
  success: boolean;
  method: ContactMethod;
  outcome: ContactOutcome;
  error?: string;
}

const TEMPLATES: Record<string, (name: string, amount: number) => string> = {
  confirm: (name, amount) =>
    `Salem ${name} 🌙 Merci pour ta commande ${amount} TND. T'es toujours disponible pour la livraison ? Confirme-moi stp 🙏`,
  reminder: (name) =>
    `Rappel ${name} ⏰ Ta commande mazelha en attente de confirmation. Radd houne bach n'planifioulivraison.`,
  risk_alert: (name) =>
    `Salem ${name} ⚠️ On a besoin de vérifier quelques infos pour ta commande. Tu peux nous confirmer tes coordonnées ? Merci 🙏`,
};

export async function attemptContact(
  orgId: string,
  orderId: string,
  method: ContactMethod,
  operator?: string,
  notes?: string,
): Promise<ContactResult> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
      select: { buyerPhone: true, buyerName: true, amount: true },
    });

    if (!order) {
      return { success: false, method, outcome: "failed", error: "Order not found" };
    }

    if (method === "whatsapp" || method === "sms") {
      const templateKey = notes?.includes("Template:") ? notes.replace("Template: ", "").trim() : "confirm";
      const text = TEMPLATES[templateKey]?.(order.buyerName, Number(order.amount))
        ?? TEMPLATES.confirm(order.buyerName, Number(order.amount));

      await addEvent(orgId, orderId, "comm.message_sent", "system", {
        to: order.buyerPhone,
        type: "text",
        template: templateKey,
      });
    }

    await prisma.confirmationAttempt.create({
      data: {
        order: { connect: { id: orderId } },
        method,
        outcome: "no_answer",
        notes: notes ?? null,
        attemptedBy: operator ?? null,
      },
    });

    return { success: true, method, outcome: "no_answer" };
  } catch (e) {
    return {
      success: false,
      method,
      outcome: "failed",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export async function getContactHistory(
  orgId: string,
  orderId: string,
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
  templateType: "confirm" | "reminder" | "risk_alert" = "confirm",
): Promise<ContactResult> {
  return attemptContact(orgId, orderId, "whatsapp", undefined, `Template: ${templateType}`);
}

export async function mockSendSMS(
  orgId: string,
  orderId: string,
): Promise<ContactResult> {
  return attemptContact(orgId, orderId, "sms");
}

export async function mockLogManualCall(
  orgId: string,
  orderId: string,
  outcome: ContactOutcome,
  operator: string,
  notes?: string,
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

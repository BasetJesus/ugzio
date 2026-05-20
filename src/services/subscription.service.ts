import { prisma } from "@/lib/db";
import { initPayment, getPaymentStatus } from "@/lib/billing/konnect";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://ugzio.app";

export async function getSubscription(orgId: string) {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { organizationId: orgId },
      include: { plan: true },
    });
    if (!sub) return null;
    return {
      id: sub.id,
      status: sub.status,
      planId: sub.planId,
      planName: sub.plan.name,
      planPrice: sub.plan.price,
      currency: sub.plan.currency,
      maxOrdersPerMonth: sub.plan.maxOrdersPerMonth,
      currentPeriodStart: sub.currentPeriodStart.toISOString(),
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      canceledAt: sub.canceledAt?.toISOString() ?? null,
      konnectSubscriptionId: sub.konnectSubscriptionId,
    };
  } catch {
    return null;
  }
}

export async function getUsage(orgId: string) {
  try {
    const meter = await prisma.usageMeter.findFirst({
      where: {
        organizationId: orgId,
        periodStart: { lte: new Date() },
        periodEnd: { gte: new Date() },
      },
    });
    return {
      ordersProcessed: meter?.ordersProcessed ?? 0,
      ordersLimit: meter?.ordersLimit ?? 3,
      verificationsSent: meter?.verificationsSent ?? 0,
      verificationsLimit: meter?.verificationsLimit ?? 3,
      aiInsightsGenerated: meter?.aiInsightsGenerated ?? 0,
      aiInsightsLimit: meter?.aiInsightsLimit ?? 0,
    };
  } catch {
    return null;
  }
}

export async function createCheckout(orgId: string, planName: string) {
  try {
    const plan = await prisma.plan.findUnique({ where: { name: planName } });
    if (!plan) return { success: false as const, error: "Plan not found" };

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true, sellerPhone: true },
    });
    if (!org) return { success: false as const, error: "Organization not found" };

    const existingSub = await prisma.subscription.findUnique({
      where: { organizationId: orgId },
      include: { plan: true },
    });

    const currentPlan = existingSub?.plan.name ?? "free";
    const description = currentPlan === "free"
      ? `UGZIO ${planName} — ${plan.price} TND/mois`
      : `UGZIO changement plan: ${currentPlan} → ${planName} — ${plan.price} TND/mois`;

    const result = await initPayment({
      amount: plan.price,
      description,
      orderId: `sub-${orgId}-${planName}-${Date.now()}`,
      webhook: `${BASE_URL}/api/v1/billing/webhook`,
    });

    return {
      success: true as const,
      payUrl: result.payUrl,
      paymentRef: result.paymentRef,
      planName,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout creation failed";
    return { success: false as const, error: msg };
  }
}

export async function handlePaymentWebhook(paymentRef: string) {
  try {
    const details = await getPaymentStatus(paymentRef);
    const payment = details.payment;
    const orderId = payment.orderId ?? "";

    if (!orderId.startsWith("sub-")) {
      console.warn("[subscription] Ignoring non-subscription payment:", orderId);
      return { success: false as const, error: "Not a subscription payment" };
    }

    const parts = orderId.split("-");
    const orgId = parts[1];
    const planName = parts[2];
    const transactionStatus = payment.transaction?.status;

    if (payment.status === "completed" && transactionStatus === "success") {
      const plan = await prisma.plan.findUnique({ where: { name: planName } });
      if (!plan) return { success: false as const, error: "Plan not found" };

      const existing = await prisma.subscription.findUnique({
        where: { organizationId: orgId },
      });

      if (existing) {
        await prisma.subscription.update({
          where: { organizationId: orgId },
          data: {
            planId: plan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            konnectSubscriptionId: paymentRef,
            canceledAt: null,
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            organizationId: orgId,
            planId: plan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            konnectSubscriptionId: paymentRef,
          },
        });
      }

      const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
      const existingMeter = await prisma.usageMeter.findFirst({
        where: { organizationId: orgId, periodStart: { lte: new Date() }, periodEnd: { gte: new Date() } },
      });
      if (existingMeter) {
        await prisma.usageMeter.update({
          where: { id: existingMeter.id },
          data: {
            ordersLimit: plan.maxOrdersPerMonth,
            aiInsightsLimit: plan.aiInsightsPerMonth,
            verificationsLimit: plan.verificationsPerMonth,
          },
        });
      } else {
        await prisma.usageMeter.create({
          data: {
            organizationId: orgId,
            periodStart,
            periodEnd,
            ordersProcessed: 0,
            ordersLimit: plan.maxOrdersPerMonth,
            aiInsightsGenerated: 0,
            aiInsightsLimit: plan.aiInsightsPerMonth,
            verificationsSent: 0,
            verificationsLimit: plan.verificationsPerMonth,
          },
        });
      }

      return { success: true as const, planName };
    }

    if (payment.status === "failed" || payment.status === "canceled") {
      return { success: false as const, error: `Payment ${payment.status}` };
    }

    return { success: false as const, error: `Payment ${payment.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Webhook handling failed";
    return { success: false as const, error: msg };
  }
}

export async function cancelSubscription(orgId: string) {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { organizationId: orgId },
      include: { plan: true },
    });
    if (!sub) return { success: false as const, error: "No subscription" };
    if (sub.plan.name === "free") return { success: false as const, error: "Cannot cancel free plan" };

    await prisma.subscription.update({
      where: { organizationId: orgId },
      data: {
        status: "canceled",
        canceledAt: new Date(),
      },
    });

    return { success: true as const };
  } catch {
    return { success: false as const, error: "Cancel failed" };
  }
}

export async function changePlan(orgId: string, newPlanName: string) {
  try {
    if (newPlanName === "free") {
      return { success: false as const, error: "Cannot downgrade to free" };
    }

    const plan = await prisma.plan.findUnique({ where: { name: newPlanName } });
    if (!plan) return { success: false as const, error: "Plan not found" };

    return await createCheckout(orgId, newPlanName);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Change plan failed";
    return { success: false as const, error: msg };
  }
}

export async function getAllPlans() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
    });
    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      currency: p.currency,
      maxOrdersPerMonth: p.maxOrdersPerMonth,
      hasZioConfirm: p.hasZioConfirm,
      hasZioBrain: p.hasZioBrain,
      hasZioConnect: p.hasZioConnect,
      hasZioFlow: p.hasZioFlow,
      hasZioNetwork: p.hasZioNetwork,
      aiInsightsPerMonth: p.aiInsightsPerMonth,
      verificationsPerMonth: p.verificationsPerMonth,
    }));
  } catch {
    return [];
  }
}


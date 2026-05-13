import { prisma } from "@/lib/db";
import { emit } from "@/lib/events/event-bus";

export interface ActivationStatus {
  hasOrders: boolean
  hasRiskData: boolean
  hasConfirmations: boolean
  completedSteps: number
  totalSteps: number
}

const SAMPLE_BUYERS = [
  { name: "Amine Letaief", phone: "+216 50 123 401", wilaya: "Tunis", amount: 89.0, product: "Sac à main en cuir" },
  { name: "Sarra Mhenni", phone: "+216 50 123 402", wilaya: "Sfax", amount: 245.0, product: "Montre connectée" },
  { name: "Karim Jaziri", phone: "+216 50 123 403", wilaya: "Sousse", amount: 55.0, product: "Parfum Oud Royal" },
  { name: "Mariem Ben Ali", phone: "+216 50 123 404", wilaya: "Nabeul", amount: 180.0, product: "Casque audio" },
  { name: "Mehdi Khedher", phone: "+216 50 123 405", wilaya: "Monastir", amount: 320.0, product: "Smartphone" },
  { name: "Nadia Trabelsi", phone: "+216 50 123 406", wilaya: "Gabès", amount: 95.0, product: "Robine" },
  { name: "Hichem Gharbi", phone: "+216 50 123 407", wilaya: "Kairouan", amount: 150.0, product: "Sac à dos" },
  { name: "Rania Ferchichi", phone: "+216 50 123 408", wilaya: "Ben Arous", amount: 75.0, product: "Lunettes de soleil" },
]

const HIGH_RISK_BUYERS = [
  { name: "Firas Makhlouf", phone: "+216 50 123 501", wilaya: "Kairouan", amount: 420.0, product: "Appareil photo" },
  { name: "Lilia Ben Salah", phone: "+216 50 123 502", wilaya: "Gabès", amount: 560.0, product: "Ordinateur portable" },
]

export async function createOrganization(
  name: string,
  userId: string,
  sellerPhone?: string,
): Promise<{ id: string }> {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const org = await prisma.organization.create({
    data: {
      name,
      slug: `${slug}-${userId.slice(0, 6)}`,
      sellerPhone: sellerPhone ?? null,
      sellerName: name,
    },
  })

  await prisma.organizationMember.create({
    data: { organizationId: org.id, userId, role: "owner" },
  })

  const plan = await prisma.plan.findUnique({ where: { name: "free" } })
  if (plan) {
    await prisma.subscription.create({
      data: {
        organizationId: org.id,
        planId: plan.id,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  return { id: org.id }
}

export async function generateSampleData(orgId: string): Promise<{ ordersCreated: number; highRiskCount: number }> {
  let highRiskCount = 0

  for (const buyer of SAMPLE_BUYERS) {
    const isHighRisk = buyer.amount > 200
    const riskLevel = isHighRisk ? "high" : buyer.amount > 100 ? "medium" : "low"
    const trustScore = isHighRisk ? 25 : Math.floor(Math.random() * 40) + 50

    const order = await prisma.order.create({
      data: {
        organizationId: orgId,
        buyerName: buyer.name,
        buyerPhone: buyer.phone,
        product: buyer.product,
        buyerWilaya: buyer.wilaya,
        amount: buyer.amount,
        riskLevel,
        trustScore,
        status: "CREATED",
        confirmStatus: isHighRisk ? "pending_confirmation" : "confirmed",
      },
    })

    if (isHighRisk) highRiskCount++

    emit("ORDER_CREATED", {
      orderId: order.id,
      orgId,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      amount: buyer.amount,
      product: buyer.product,
    })

    emit("RISK_CALCULATED", {
      orderId: order.id,
      orgId,
      riskScore: 100 - trustScore,
      riskLevel,
      trustScore,
      signals: isHighRisk
        ? ["first-time-order", "high-amount", "unusual-region"]
        : ["first-time-order"],
    })
  }

  for (const buyer of HIGH_RISK_BUYERS) {
    const order = await prisma.order.create({
      data: {
        organizationId: orgId,
        buyerName: buyer.name,
        buyerPhone: buyer.phone,
        product: buyer.product,
        buyerWilaya: buyer.wilaya,
        amount: buyer.amount,
        riskLevel: "high",
        trustScore: 15,
        status: "CREATED",
        confirmStatus: "pending_confirmation",
      },
    })

    highRiskCount++

    emit("ORDER_CREATED", {
      orderId: order.id,
      orgId,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      amount: buyer.amount,
      product: buyer.product,
    })

    emit("RISK_CALCULATED", {
      orderId: order.id,
      orgId,
      riskScore: 85,
      riskLevel: "high",
      trustScore: 15,
      signals: ["first-time-order", "high-amount", "unusual-region", "prior-failures"],
    })

    emit("ORDER_FLAGGED", {
      orderId: order.id,
      orgId,
      buyerPhone: buyer.phone,
      buyerName: buyer.name,
      riskScore: 85,
    })
  }

  return { ordersCreated: SAMPLE_BUYERS.length + HIGH_RISK_BUYERS.length, highRiskCount }
}

export function getActivationStatus(orgId: string, events: { eventType: string }[]): ActivationStatus {
  const eventTypes = new Set(events.map((e) => e.eventType))
  const hasOrders = eventTypes.has("FIRST_ORDER_CREATED")
  const hasRiskData = eventTypes.has("FIRST_TRUST_SCORE")
  const hasConfirmations = eventTypes.has("FIRST_VERIFICATION_SENT")

  let completedSteps = 0
  if (hasOrders) completedSteps++
  if (hasRiskData) completedSteps++
  if (hasConfirmations) completedSteps++

  return {
    hasOrders,
    hasRiskData,
    hasConfirmations,
    completedSteps,
    totalSteps: 3,
  }
}

export function ensureOrgAccess(orgId: string): void {
  if (!orgId || typeof orgId !== "string") {
    throw new Error("Organization access denied")
  }
}

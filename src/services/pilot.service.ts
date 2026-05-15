import { prisma } from "@/lib/db"
import { safeAsync } from "@/lib/core/safe-render"

export interface QuickstartProgress {
  whatsappConnected: boolean
  ordersImported: boolean
  firstConfirmationDone: boolean
  firstDeliveryProtected: boolean
  firstUgcSent: boolean
  totalSteps: number
  completedSteps: number
  nextAction: string
}

export interface First48HoursData {
  hoursSinceOnboarding: number
  milestones: Milestone[]
  isActive: boolean
}

export interface Milestone {
  id: string
  label: string
  done: boolean
  value: string
}

export interface SuccessMoment {
  id: string
  type: "revenue_protected" | "delivery_prevented" | "buyer_confirmed" | "ugc_received" | "first_action"
  amount: number
  label: string
  timestamp: string
}

export interface SellerHealth {
  rtsTrend: "improving" | "stable" | "declining"
  confirmationSpeed: number
  buyerResponsiveness: number
  trustMomentum: number
  operationalStability: "stable" | "attention" | "critical"
  totalOrders: number
  confirmedRate: number
  deliveredRate: number
}

export async function getQuickstartProgress(orgId: string): Promise<QuickstartProgress> {
  try {
    const [org, orderCount, confirmedCount, outcomeCount, ugcCount] = await Promise.all([
      prisma.organization.findFirst({ where: { id: orgId }, select: { sellerPhone: true, createdAt: true } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, confirmStatus: "confirmed" } }),
      prisma.operationOutcome.count({ where: { organizationId: orgId, actionTaken: "confirm" } }),
      prisma.ugcItem.count({ where: { order: { organizationId: orgId } } }),
    ])

    const whatsappConnected = !!org?.sellerPhone
    const ordersImported = orderCount > 0
    const firstConfirmationDone = confirmedCount > 0
    const firstDeliveryProtected = outcomeCount > 0
    const firstUgcSent = ugcCount > 0

    const steps = [whatsappConnected, ordersImported, firstConfirmationDone, firstDeliveryProtected, firstUgcSent]
    const completed = steps.filter(Boolean).length
    const total = steps.length

    let nextAction = "Connecter votre WhatsApp"
    if (!ordersImported) nextAction = "Importer vos premières commandes"
    else if (!firstConfirmationDone) nextAction = "Confirmer votre premier acheteur"
    else if (!firstDeliveryProtected) nextAction = "Protéger votre première livraison"
    else if (!firstUgcSent) nextAction = "Demander votre premier UGC"
    else nextAction = "Toutes les étapes terminées — vous êtes opérationnel"

    return { whatsappConnected, ordersImported, firstConfirmationDone, firstDeliveryProtected, firstUgcSent, totalSteps: total, completedSteps: completed, nextAction }
  } catch {
    return { whatsappConnected: false, ordersImported: false, firstConfirmationDone: false, firstDeliveryProtected: false, firstUgcSent: false, totalSteps: 5, completedSteps: 0, nextAction: "Configurer votre compte" }
  }
}

export async function getFirst48Hours(orgId: string): Promise<First48HoursData> {
  try {
    const org = await prisma.organization.findFirst({ where: { id: orgId }, select: { createdAt: true, sellerPhone: true } })
    if (!org) return { hoursSinceOnboarding: 0, milestones: [], isActive: false }

    const hoursSinceOnboarding = Math.round((Date.now() - org.createdAt.getTime()) / 3600000)
    const isActive = hoursSinceOnboarding <= 48

    const [orderCount, confirmedCount, outcomeCount, ugcCount] = await Promise.all([
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, confirmStatus: "confirmed" } }),
      prisma.operationOutcome.count({ where: { organizationId: orgId, actionTaken: "confirm" } }),
      prisma.ugcItem.count({ where: { order: { organizationId: orgId } } }),
    ])

    const milestones: Milestone[] = [
      { id: "connect", label: "Connecter WhatsApp", done: !!org.sellerPhone, value: org.sellerPhone ? "Connecté" : "Pas encore" },
      { id: "import", label: "Importer commandes", done: orderCount > 0, value: orderCount + " commandes" },
      { id: "confirm", label: "Première confirmation", done: confirmedCount > 0, value: confirmedCount > 0 ? "Fait" : "En attente" },
      { id: "protect", label: "Première livraison protégée", done: outcomeCount > 0, value: outcomeCount > 0 ? outcomeCount + " protégée(s)" : "En attente" },
      { id: "ugc", label: "Première demande UGC", done: ugcCount > 0, value: ugcCount > 0 ? "Fait" : "Pas encore" },
    ]

    return { hoursSinceOnboarding, milestones, isActive }
  } catch {
    return { hoursSinceOnboarding: 0, milestones: [], isActive: false }
  }
}

export async function getSuccessMoments(orgId: string, limit: number = 5): Promise<SuccessMoment[]> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [outcomes, events] = await Promise.all([
      prisma.operationOutcome.findMany({
        where: { organizationId: orgId, createdAt: { gte: today } },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { order: { select: { buyerName: true, amount: true } } },
      }),
      prisma.operationEvent.findMany({
        where: { organizationId: orgId, createdAt: { gte: today }, type: { in: ["confirmed", "ugc_received", "delivery_completed"] } },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ])

    const moments: SuccessMoment[] = []

    for (const o of outcomes) {
      if (o.actionTaken === "confirm") {
        moments.push({
          id: "outcome_" + o.id,
          type: "revenue_protected",
          amount: Number(o.estimatedRevenueSaved),
          label: Number(o.estimatedRevenueSaved).toFixed(0) + " TND protégé — " + o.order.buyerName,
          timestamp: o.createdAt.toISOString(),
        })
      }
    }

    for (const e of events) {
      if (e.type === "confirmed") {
        moments.push({
          id: "event_" + e.id,
          type: "buyer_confirmed",
          amount: 0,
          label: "Acheteur confirmé",
          timestamp: e.createdAt.toISOString(),
        })
      }
      if (e.type === "ugc_received") {
        moments.push({
          id: "ugc_" + e.id,
          type: "ugc_received",
          amount: 0,
          label: "Première demande UGC envoyée",
          timestamp: e.createdAt.toISOString(),
        })
      }
      if (e.type === "delivery_completed") {
        moments.push({
          id: "delivery_" + e.id,
          type: "revenue_protected",
          amount: 0,
          label: "Livraison réussie",
          timestamp: e.createdAt.toISOString(),
        })
      }
    }

    if (moments.length === 0) {
      moments.push({
        id: "default_start",
        type: "first_action",
        amount: 0,
        label: "Commencez — votre premier succès apparaîtra ici",
        timestamp: new Date().toISOString(),
      })
    }

    return moments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit)
  } catch {
    return [{
      id: "default_empty",
      type: "first_action",
      amount: 0,
      label: "Commencez — votre premier succès apparaîtra ici",
      timestamp: new Date().toISOString(),
    }]
  }
}

export async function getSellerHealth(orgId: string): Promise<SellerHealth> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [totalOrders, confirmedOrders, deliveredOrders, outcomes, recentEvents] = await Promise.all([
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, confirmStatus: "confirmed" } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: { in: ["DELIVERED", "UGC_REQUESTED", "UGC_RECEIVED"] } } }),
      prisma.operationOutcome.findMany({ where: { organizationId: orgId, createdAt: { gte: weekAgo } }, orderBy: { createdAt: "desc" } }),
      prisma.operationEvent.findMany({ where: { organizationId: orgId, createdAt: { gte: weekAgo }, type: { in: ["confirmed", "buyer_replied", "buyer_confirmed"] } }, orderBy: { createdAt: "asc" } }),
    ])

    const confirmedRate = totalOrders > 0 ? Math.round((confirmedOrders / totalOrders) * 100) : 0
    const deliveredRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0

    const prevWeekEvents = await prisma.operationEvent.count({
      where: { organizationId: orgId, createdAt: { gte: new Date(weekAgo.getTime() - 604800000), lt: weekAgo } },
    })
    const thisWeekEvents = await prisma.operationEvent.count({ where: { organizationId: orgId, createdAt: { gte: weekAgo } } })

    const activityTrend = prevWeekEvents > 0 ? (thisWeekEvents - prevWeekEvents) / prevWeekEvents : 0
    const rtsTrend: "improving" | "stable" | "declining" = activityTrend > 0.1 ? "improving" : activityTrend < -0.1 ? "declining" : "stable"

    const totalEventDuration = recentEvents.length >= 2
      ? (new Date(recentEvents[recentEvents.length - 1].createdAt).getTime() - new Date(recentEvents[0].createdAt).getTime()) / 60000
      : 0
    const confirmationSpeed = recentEvents.length >= 2 ? Math.round(totalEventDuration / recentEvents.length) : 0

    const buyerResponseEvents = recentEvents.filter((e) => e.type === "buyer_replied" || e.type === "buyer_confirmed").length
    const totalContactEvents = recentEvents.filter((e) => e.type === "confirmed").length
    const buyerResponsiveness = totalContactEvents > 0 ? Math.round((buyerResponseEvents / totalContactEvents) * 100) : 0

    const trustMomentum = confirmedRate

    const highRiskCount = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null, riskLevel: "high" } })
    const operationalStability: "stable" | "attention" | "critical" = highRiskCount > 5 ? "critical" : highRiskCount > 2 ? "attention" : "stable"

    return {
      rtsTrend,
      confirmationSpeed,
      buyerResponsiveness,
      trustMomentum,
      operationalStability,
      totalOrders,
      confirmedRate,
      deliveredRate,
    }
  } catch {
    return {
      rtsTrend: "stable",
      confirmationSpeed: 0,
      buyerResponsiveness: 0,
      trustMomentum: 0,
      operationalStability: "stable",
      totalOrders: 0,
      confirmedRate: 0,
      deliveredRate: 0,
    }
  }
}

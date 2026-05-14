import { prisma } from "@/lib/db"
import type { CommunicationPerformance } from "@/types/whatsapp"

export async function getCommunicationPerformance(orgId: string): Promise<CommunicationPerformance> {
  try {
    const [totalAttempts, confirmedAttempts, unreachableAttempts, totalOrders, operationEvents] = await Promise.all([
      prisma.confirmationAttempt.count({ where: { order: { organizationId: orgId }, method: "whatsapp" } }),
      prisma.confirmationAttempt.count({ where: { order: { organizationId: orgId }, method: "whatsapp", outcome: "confirmed" } }),
      prisma.confirmationAttempt.count({ where: { order: { organizationId: orgId }, method: "whatsapp", outcome: "unreachable" } }),
      prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.operationEvent.findMany({
        where: { organizationId: orgId, type: { in: ["buyer_replied", "whatsapp_opened"] } },
        select: { type: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ])

    const repliedEvents = operationEvents.filter((e) => e.type === "buyer_replied").length
    const totalSent = totalAttempts

    const replyRate = totalSent > 0 ? Math.round((repliedEvents / totalSent) * 100) : 0
    const confirmedRate = totalSent > 0 ? Math.round((confirmedAttempts / totalSent) * 100) : 0
    const unreachableRate = totalSent > 0 ? Math.round((unreachableAttempts / totalSent) * 100) : 0

    const preWhatsAppOrders = await prisma.confirmationAttempt.count({
      where: {
        order: { organizationId: orgId },
        method: { not: "whatsapp" },
        outcome: "confirmed",
      },
    })
    const preWhatsAppTotal = await prisma.confirmationAttempt.count({
      where: {
        order: { organizationId: orgId },
        method: { not: "whatsapp" },
      },
    })
    const preWhatsAppRate = preWhatsAppTotal > 0 ? Math.round((preWhatsAppOrders / preWhatsAppTotal) * 100) : 0

    const confirmationImprovement = preWhatsAppRate > 0 ? confirmedRate - preWhatsAppRate : confirmedRate

    const preWhatsAppUnreachable = await prisma.confirmationAttempt.count({
      where: {
        order: { organizationId: orgId },
        method: { not: "whatsapp" },
        outcome: "unreachable",
      },
    })
    const preWhatsAppUnreachableRate = preWhatsAppTotal > 0 ? Math.round((preWhatsAppUnreachable / preWhatsAppTotal) * 100) : 0
    const unreachableReduction = preWhatsAppUnreachableRate > 0
      ? Math.max(0, preWhatsAppUnreachableRate - unreachableRate)
      : 0

    const avgOrderValue = totalOrders > 0
      ? await prisma.order.aggregate({ where: { organizationId: orgId, deletedAt: null }, _avg: { amount: true } })
      : null
    const avgAmount = avgOrderValue?._avg?.amount ?? 0

    const rtsImpact = Math.round((confirmedAttempts * Number(avgAmount) * 0.15) + (replyRate / 100) * Number(avgAmount) * 0.1)

    return {
      replyRate,
      confirmationImprovement,
      unreachableReduction,
      rtsImpact,
      totalSent,
      totalReplied: repliedEvents,
      totalConfirmed: confirmedAttempts,
      totalUnreachable: unreachableAttempts,
    }
  } catch {
    return {
      replyRate: 0,
      confirmationImprovement: 0,
      unreachableReduction: 0,
      rtsImpact: 0,
      totalSent: 0,
      totalReplied: 0,
      totalConfirmed: 0,
      totalUnreachable: 0,
    }
  }
}

import { prisma } from "@/lib/db"

export interface GrowthMetrics {
  requestsSent: number
  responsesReceived: number
  responseRate: number
  totalApproved: number
  totalRejected: number
  approvalRate: number
  ugcRevenue: number
  topProducts: { product: string; count: number }[]
}

export async function getGrowthMetrics(orgId: string): Promise<GrowthMetrics> {
  try {
    const requestsSent = await prisma.messageTimelineEntry.count({
      where: {
        order: { organizationId: orgId },
        eventType: "d3_ugc_ask",
        status: "sent",
      },
    })

    const [ugcItems, ugcOrders] = await Promise.all([
      prisma.ugcItem.findMany({
        where: { order: { organizationId: orgId } },
        select: { status: true, order: { select: { amount: true, product: true } } },
      }),
      prisma.order.findMany({
        where: { organizationId: orgId, status: "UGC_RECEIVED", deletedAt: null },
        select: { amount: true },
      }),
    ])

    const totalItems = ugcItems.length
    const approved = ugcItems.filter((i) => i.status === "approved").length
    const rejected = ugcItems.filter((i) => i.status === "rejected").length
    const responsesReceived = totalItems
    const ugcRevenue = ugcOrders.reduce((sum, o) => sum + Number(o.amount), 0)

    const productCounts = new Map<string, number>()
    for (const i of ugcItems) {
      const product = i.order.product ?? "unknown"
      productCounts.set(product, (productCounts.get(product) ?? 0) + 1)
    }
    const topProducts = [...productCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([product, count]) => ({ product, count }))

    return {
      requestsSent,
      responsesReceived,
      responseRate: requestsSent > 0 ? Math.round((responsesReceived / requestsSent) * 100) : 0,
      totalApproved: approved,
      totalRejected: rejected,
      approvalRate: responsesReceived > 0 ? Math.round((approved / responsesReceived) * 100) : 0,
      ugcRevenue,
      topProducts,
    }
  } catch {
    return {
      requestsSent: 0,
      responsesReceived: 0,
      responseRate: 0,
      totalApproved: 0,
      totalRejected: 0,
      approvalRate: 0,
      ugcRevenue: 0,
      topProducts: [],
    }
  }
}

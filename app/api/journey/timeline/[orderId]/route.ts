import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getOrgFromUserId } from "@/lib/billing/enforce"
import { getOrderJourneyTimeline } from "@/services/buyer-journey.service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

  const orgId = await getOrgFromUserId(session.user.id)
  if (!orgId) return new NextResponse("Forbidden", { status: 403 })

  const { orderId } = await params
  const timeline = await getOrderJourneyTimeline(orgId, orderId)

  return NextResponse.json(timeline)
}

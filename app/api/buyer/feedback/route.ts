import { NextResponse } from "next/server"
import { submitBuyerFeedback } from "@/services/buyer-order.service"

export async function POST(req: Request) {
  try {
    const { orderId, satisfaction, note } = await req.json()
    if (!orderId || satisfaction == null) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
    }

    const result = await submitBuyerFeedback(orderId, satisfaction, note)
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

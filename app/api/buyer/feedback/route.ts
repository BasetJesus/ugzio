import { NextResponse } from "next/server"
import { submitBuyerFeedback } from "@/services/buyer-order.service"

export async function POST(req: Request) {
  try {
    const { token, satisfaction, note } = await req.json()
    if (!token || satisfaction == null) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
    }

    const result = await submitBuyerFeedback(token, satisfaction, note)
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

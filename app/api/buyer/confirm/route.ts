import { NextResponse } from "next/server"
import { buyerConfirmOrder } from "@/services/buyer-order.service"

export async function POST(req: Request) {
  try {
    const { token, action } = await req.json()
    if (!token || !action) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
    }

    if (action !== "confirm" && action !== "question") {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    const result = await buyerConfirmOrder(token, action)
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

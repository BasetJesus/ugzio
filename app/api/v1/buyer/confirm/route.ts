import { NextResponse } from "next/server"
import { buyerConfirmOrder } from "@/services/buyer-order.service"
import { buyerConfirmSchema, formatZodErrors } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = buyerConfirmSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodErrors(parsed.error) }, { status: 400 })
    }
    const { token, action } = parsed.data

    const result = await buyerConfirmOrder(token, action || "confirm")
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

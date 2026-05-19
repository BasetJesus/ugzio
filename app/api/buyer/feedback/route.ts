import { NextResponse } from "next/server"
import { submitBuyerFeedback } from "@/services/buyer-order.service"
import { buyerFeedbackSchema, formatZodErrors } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = buyerFeedbackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodErrors(parsed.error) }, { status: 400 })
    }
    const { token, rating, comment } = parsed.data

    const result = await submitBuyerFeedback(token, rating, comment)
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

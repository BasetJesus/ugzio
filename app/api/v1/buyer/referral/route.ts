import { NextResponse } from "next/server"
import { recordReferralConversion } from "@/services/referral.service"
import { buyerReferralSchema, formatZodErrors } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = buyerReferralSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodErrors(parsed.error) }, { status: 400 })
    }
    const { code, phone } = parsed.data

    const result = await recordReferralConversion(code, phone)
    if (!result.success) {
      const status = result.error === "invalid_code" ? 404 : result.error === "already_used" ? 409 : 500
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

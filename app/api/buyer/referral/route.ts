import { NextResponse } from "next/server"
import { recordReferralConversion } from "@/services/referral.service"

export async function POST(req: Request) {
  try {
    const { code, phone } = await req.json()
    if (!code || !phone) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
    }

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

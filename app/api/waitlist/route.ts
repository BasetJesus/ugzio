import { NextResponse } from "next/server"
import { addWaitlistEntry } from "@/services/waitlist.service"
import { waitlistSchema, formatZodErrors } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = waitlistSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 })
    }
    const { name, email, phone, niche } = parsed.data

    const result = await addWaitlistEntry({ name, email, phone, niche })
    if (!result.success) {
      const status = result.error === "Cet email est déjà inscrit" ? 409 : 500
      return NextResponse.json({ error: result.error }, { status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[waitlist] error:", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}

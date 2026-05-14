import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, niche } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Nom et email requis" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    const existing = await prisma.waitlistEntry.findFirst({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà inscrit" }, { status: 409 })
    }

    await prisma.waitlistEntry.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || null,
        niche: niche || null,
        status: "new",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[waitlist] error:", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}

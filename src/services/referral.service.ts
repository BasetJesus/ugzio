import { prisma } from "@/lib/db"

function generateCode(orderId: string): string {
  return orderId.slice(-8).toUpperCase()
}

export async function getOrCreateReferral(orderId: string) {
  try {
    const existing = await prisma.referral.findFirst({
      where: { referrerId: orderId },
    })
    if (existing) return existing

    const code = generateCode(orderId)
    const referral = await prisma.referral.create({
      data: { referrerId: orderId, code },
    })
    return referral
  } catch {
    return null
  }
}

export async function recordReferralConversion(code: string, referredPhone: string) {
  try {
    const referral = await prisma.referral.findUnique({ where: { code } })
    if (!referral) return { success: false, error: "invalid_code" }
    if (referral.referredId) return { success: false, error: "already_used" }

    await prisma.referral.update({
      where: { id: referral.id },
      data: { referredId: referredPhone },
    })
    return { success: true }
  } catch {
    return { success: false, error: "server_error" }
  }
}

export async function getReferralStats(orderId: string) {
  try {
    const referral = await prisma.referral.findFirst({
      where: { referrerId: orderId },
    })
    if (!referral) return { code: null, converted: false, referredPhone: null }

    return {
      code: referral.code,
      converted: !!referral.referredId,
      referredPhone: referral.referredId,
    }
  } catch {
    return { code: null, converted: false, referredPhone: null }
  }
}


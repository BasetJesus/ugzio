import { prisma } from "@/lib/db";

export async function addWaitlistEntry(data: { name: string; email: string; phone?: string; niche?: string }) {
  try {
    const existing = await prisma.waitlistEntry.findFirst({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) return { success: false, error: "Cet email est déjà inscrit" } as const;

    await prisma.waitlistEntry.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone || null,
        niche: data.niche || null,
        status: "new",
      },
    });

    return { success: true } as const;
  } catch (e) {
    console.error("[waitlist.service] addWaitlistEntry failed:", e);
    return { success: false, error: "Erreur interne" } as const;
  }
}

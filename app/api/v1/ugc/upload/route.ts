import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { alertSeller, ugcReceivedAlert } from "@/lib/alerts/seller";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string | null;
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;

    if (!token || !file) {
      return NextResponse.json({ error: "token and file are required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté. Utilisez JPG, PNG, WebP, MP4 ou MOV." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux. Maximum 5 MB." }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { token, deletedAt: null, status: { in: ["DELIVERED", "UGC_REQUESTED"] } },
      include: { organization: { select: { id: true, name: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable ou UGC non disponible." }, { status: 404 });
    }

    const mediaType = file.type.startsWith("video/") ? "video" : "image";
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    await prisma.ugcItem.create({
      data: {
        orderId: order.id,
        mediaUrl: dataUrl,
        mediaType,
        buyerPhone: order.buyerPhone,
        status: "received",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "UGC_RECEIVED" },
    });

    await alertSeller(order.organizationId, ugcReceivedAlert(order.buyerName));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[ugc/upload] failed:", e);
    return NextResponse.json({ error: "Erreur lors du téléchargement. Réessayez." }, { status: 500 });
  }
}

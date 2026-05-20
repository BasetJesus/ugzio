import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { importExternalOrder } from "@/services/integrations/base-integration.service";
import { prisma } from "@/lib/db";

interface WebhookPayload {
  platform: string;
  event: string;
  data: {
    orderId?: string;
    buyerName: string;
    buyerPhone: string;
    amount: number;
    product?: string;
    city?: string;
    address?: string;
    currency?: string;
  };
}

function verifySignature(payload: string, signature: string | null, secret: string | undefined): boolean {
  if (!secret) return true;
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return signature === expected;
}

export async function POST(request: NextRequest) {
  try {
    const platform = request.headers.get("x-platform") ?? "";
    const signature = request.headers.get("x-signature") ?? "";
    const payloadText = await request.text();

    const validPlatforms = ["shopify", "youcan", "woocommerce", "tiktak"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: "Unsupported platform. Set X-Platform header." }, { status: 400 });
    }

    let body: WebhookPayload;
    try {
      body = JSON.parse(payloadText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { data } = body;
    if (!data?.buyerName || !data?.buyerPhone || !data?.amount) {
      return NextResponse.json({ error: "Missing required fields: buyerName, buyerPhone, amount" }, { status: 400 });
    }

    const integrations = await prisma.organizationIntegration.findMany({
      where: { platform, isActive: true },
      select: { organizationId: true, webhookSecret: true },
    });

    if (integrations.length === 0) {
      return NextResponse.json({ error: `No active ${platform} integrations found` }, { status: 404 });
    }

    const results: { orgId: string; success: boolean; orderId?: string; error?: string }[] = [];

    for (const integration of integrations) {
      if (!verifySignature(payloadText, signature, integration.webhookSecret ?? undefined)) {
        results.push({ orgId: integration.organizationId, success: false, error: "Invalid signature" });
        continue;
      }

      const result = await importExternalOrder(integration.organizationId, {
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
        amount: data.amount,
        product: data.product,
        buyerWilaya: data.city,
        buyerAddress: data.address,
        currency: data.currency ?? "TND",
        platformOrderId: data.orderId,
      }, platform);

      if (result.success) {
        results.push({ orgId: integration.organizationId, success: true, orderId: result.orderId });
      } else {
        results.push({ orgId: integration.organizationId, success: false, error: result.error ?? "Import failed" });
      }
    }

    return NextResponse.json({ received: true, results });
  } catch (e) {
    console.error("[webhook] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

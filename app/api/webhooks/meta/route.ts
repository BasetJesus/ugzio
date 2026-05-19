import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { processWebhookMessages } from "@/services/webhook.service";

function verifyHmac(payload: string, signature: string): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256") || "";

  if (!verifyHmac(body, signature)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  const entries = payload.entry || [];

  await processWebhookMessages(entries, signature);

  return new NextResponse("OK", { status: 200 });
}

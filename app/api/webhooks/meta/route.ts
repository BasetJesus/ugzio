import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { enqueueWebhookJob } from "@/lib/events/queues";

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

  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const value = change.value;
      if (!value) continue;
      const metadata = value.metadata;
      const phoneNumberId = metadata?.phone_number_id;

      if (value.messages) {
        for (const message of value.messages) {
          const existing = await prisma.webhookLog.findUnique({
            where: { eventId: message.id },
          });
          if (existing) continue;

          await prisma.webhookLog.create({
            data: {
              provider: "meta",
              eventType: message.type || "unknown",
              eventId: message.id,
              payload: JSON.stringify({ message, phoneNumberId }),
              signature,
              processed: false,
            },
          });

          await enqueueWebhookJob("MESSAGE_RECEIVED", {
            webhookLogId: message.id,
            message,
            phoneNumberId,
          });
        }
      }

      if (value.statuses) {
        for (const status of value.statuses) {
          const existing = await prisma.webhookLog.findUnique({
            where: { eventId: status.id },
          });
          if (existing) continue;

          await prisma.webhookLog.create({
            data: {
              provider: "meta",
              eventType: `status:${status.status}`,
              eventId: status.id,
              payload: JSON.stringify(status),
              signature,
              processed: false,
            },
          });

          await enqueueWebhookJob("STATUS_UPDATE", {
            webhookLogId: status.id,
            status,
          });
        }
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}

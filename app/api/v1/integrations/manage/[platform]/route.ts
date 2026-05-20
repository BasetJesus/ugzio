import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { saveIntegration, disconnectIntegration } from "@/services/integrations/base-integration.service";

const ALLOWED_PLATFORMS = ["shopify", "youcan", "woocommerce", "tiktak"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  try {
    const { orgId } = await requireSession();
    const { platform } = await params;

    if (!ALLOWED_PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
    }

    const body = await request.json();
    const result = await saveIntegration(orgId, platform, {
      label: body.label,
      apiKey: body.apiKey,
      apiSecret: body.apiSecret,
      storeUrl: body.storeUrl,
      webhookSecret: body.webhookSecret,
      settings: body.settings ? JSON.stringify(body.settings) : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  try {
    const { orgId } = await requireSession();
    const { platform } = await params;

    const result = await disconnectIntegration(orgId, platform);
    if (!result.success) {
      return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

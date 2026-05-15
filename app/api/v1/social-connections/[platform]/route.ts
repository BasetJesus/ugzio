import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { saveSocialConnection, disconnectSocialConnection, getSocialConnections } from "@/services/social-connection.service";

const OAUTH_CONFIGS: Record<string, { authUrl: (redirectUri: string, state: string) => string; tokenUrl: string; clientIdEnv: string; clientSecretEnv: string }> = {
  instagram: {
    authUrl: (redirectUri: string, state: string) =>
      `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish&state=${state}`,
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    clientIdEnv: "INSTAGRAM_APP_ID",
    clientSecretEnv: "INSTAGRAM_APP_SECRET",
  },
};

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") ?? "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

// GET /api/v1/social-connections/[platform] — get connection status for platform
export async function GET(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 404 });

  const connections = await getSocialConnections(orgId);
  const conn = connections.find((c) => c.platform === platform);
  return NextResponse.json({ connection: conn ?? null });
}

// POST /api/v1/social-connections/[platform] — initiate OAuth (returns auth URL)
export async function POST(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 404 });

  const config = OAUTH_CONFIGS[platform];
  if (!config) return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
  if (!process.env[config.clientIdEnv]) return NextResponse.json({ error: `${config.clientIdEnv} not configured` }, { status: 501 });

  const baseUrl = getBaseUrl(request);
  const redirectUri = `${baseUrl}/api/v1/social-connections/${platform}/callback`;
  const state = `${orgId}:${Date.now()}`;
  const authUrl = config.authUrl(redirectUri, state);

  return NextResponse.json({ authUrl });
}

// DELETE /api/v1/social-connections/[platform] — disconnect
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 404 });

  const result = await disconnectSocialConnection(orgId, platform);
  if (!result.success) return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });

  return NextResponse.json({ success: true });
}

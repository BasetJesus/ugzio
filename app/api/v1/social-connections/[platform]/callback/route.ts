import { NextRequest, NextResponse } from "next/server";
import { saveSocialConnection } from "@/services/social-connection.service";

const TOKEN_EXCHANGE: Record<string, {
  exchangeToken: (code: string, redirectUri: string) => Promise<{ accessToken: string; userId: string; userName?: string; picture?: string; followers?: number; expiresIn?: number }>
}> = {
  instagram: {
    exchangeToken: async (code: string, redirectUri: string) => {
      const formData = new URLSearchParams();
      formData.append("client_id", process.env.INSTAGRAM_APP_ID ?? "");
      formData.append("client_secret", process.env.INSTAGRAM_APP_SECRET ?? "");
      formData.append("grant_type", "authorization_code");
      formData.append("redirect_uri", redirectUri);
      formData.append("code", code);

      const res = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Instagram token exchange failed: ${err}`);
      }

      const data = await res.json();
      return {
        accessToken: data.access_token,
        userId: data.user_id,
      };
    },
  },
};

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") ?? "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

// GET /api/v1/social-connections/[platform]/callback — OAuth callback
export async function GET(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/settings/branding?social=error", request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/settings/branding?social=error", request.url));
  }

  const [orgId] = state.split(":");
  if (!orgId) {
    return NextResponse.redirect(new URL("/settings/branding?social=error", request.url));
  }

  const exchange = TOKEN_EXCHANGE[platform];
  if (!exchange) {
    return NextResponse.redirect(new URL("/settings/branding?social=error", request.url));
  }

  try {
    const baseUrl = getBaseUrl(request);
    const redirectUri = `${baseUrl}/api/v1/social-connections/${platform}/callback`;
    const tokenData = await exchange.exchangeToken(code, redirectUri);

    await saveSocialConnection(orgId, platform, {
      accountId: tokenData.userId,
      accountName: tokenData.userName,
      accountPicture: tokenData.picture,
      followersCount: tokenData.followers,
      accessToken: tokenData.accessToken,
      tokenExpiresAt: tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : undefined,
    });

    return NextResponse.redirect(new URL("/settings/branding?social=connected", request.url));
  } catch (e) {
    console.error(`[social-callback] ${platform} error:`, e);
    return NextResponse.redirect(new URL("/settings/branding?social=error", request.url));
  }
}

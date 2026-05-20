import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { getPublishedPosts, queueRepost, getFlowStats } from "@/services/zioflow.service";

export async function GET() {
  try {
    const { orgId } = await requireSession();
    const [posts, stats] = await Promise.all([
      getPublishedPosts(orgId),
      getFlowStats(orgId),
    ]);
    return NextResponse.json({ posts, stats });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireSession();
    const body = await request.json();
    const { ugcItemId, platform } = body;

    if (!ugcItemId || !platform) {
      return NextResponse.json({ error: "ugcItemId and platform are required" }, { status: 400 });
    }

    const result = await queueRepost(orgId, ugcItemId, platform);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

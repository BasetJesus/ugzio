import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { getBlacklistedPhones, blacklistPhone, unblacklistPhone } from "@/services/risk.service";
import { blacklistActionSchema, formatZodErrors } from "@/lib/validation";

export async function GET() {
  try {
    const { orgId } = await requireSession();
    const blacklisted = await getBlacklistedPhones(orgId);
    return NextResponse.json(blacklisted);
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
    const parsed = blacklistActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const { phone } = parsed.data;

    await blacklistPhone(orgId, phone);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { orgId } = await requireSession();
    const body = await request.json();
    const parsed = blacklistActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const { phone } = parsed.data;

    await unblacklistPhone(orgId, phone);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

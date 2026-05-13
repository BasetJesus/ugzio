import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { getBlacklistedPhones, blacklistPhone, unblacklistPhone } from "@/services/risk.service";

export async function GET() {
  try {
    const { orgId } = await requireSession();
    const blacklisted = await getBlacklistedPhones(orgId);
    return NextResponse.json(blacklisted);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    throw e;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireSession();
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "phone required" }, { status: 400 });
    }

    await blacklistPhone(orgId, phone);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    throw e;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { orgId } = await requireSession();
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "phone required" }, { status: 400 });
    }

    await unblacklistPhone(orgId, phone);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    throw e;
  }
}

import { NextResponse } from "next/server";
import { requireSession } from "@/services/auth.service";
import { getOrgCaptionProfile, updateOrgCaptionProfile } from "@/services/caption.service";

export async function GET() {
  try {
    const session = await requireSession();
    const profile = await getOrgCaptionProfile(session.orgId);
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ profile: null });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const result = await updateOrgCaptionProfile(session.orgId, {
      niche: body.niche ?? "",
      audience: body.audience ?? "",
      brandTone: body.brandTone ?? "funny_close",
      usp: body.usp ?? "",
    });
    if (!result.success) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

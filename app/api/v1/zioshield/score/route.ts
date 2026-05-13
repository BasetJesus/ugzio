import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { scorePhone } from "@/services/risk.service";

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireSession();
    const { phone, excludeOrderId } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "phone required" }, { status: 400 });
    }

    const result = await scorePhone(orgId, phone, excludeOrderId);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    throw e;
  }
}

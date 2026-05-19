import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { scorePhone } from "@/services/risk.service";
import { riskScoreSchema, formatZodErrors } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireSession();
    const body = await request.json();
    const parsed = riskScoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const { phone, excludeOrderId } = parsed.data;

    const result = await scorePhone(orgId, phone, excludeOrderId);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

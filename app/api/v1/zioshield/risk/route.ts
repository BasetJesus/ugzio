import { NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { getRiskDashboard } from "@/services/risk.service";

export async function GET() {
  try {
    const { orgId } = await requireSession();
    const stats = await getRiskDashboard(orgId);
    return NextResponse.json(stats);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    throw e;
  }
}

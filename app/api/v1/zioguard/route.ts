import { NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { getZioGuardStats, getOrgZioGuardContributions } from "@/services/zioguard.service";

export async function GET() {
  try {
    const { orgId } = await requireSession();
    const [stats, contributions] = await Promise.all([
      getZioGuardStats(),
      getOrgZioGuardContributions(orgId),
    ]);
    return NextResponse.json({ ...stats, yourContributions: contributions });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

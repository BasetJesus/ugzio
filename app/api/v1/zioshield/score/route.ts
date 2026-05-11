import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { computeScore } from "@/lib/zioshield/scoring";
import { getOrgFromUserId } from "@/lib/billing/enforce";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessionOrgId = await getOrgFromUserId(session.user.id);
  if (!sessionOrgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }
  const { phone, excludeOrderId } = await request.json();
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }
  const result = await computeScore(phone, sessionOrgId, excludeOrderId);
  return NextResponse.json(result);
}

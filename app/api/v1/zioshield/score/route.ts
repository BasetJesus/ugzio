import { NextRequest, NextResponse } from "next/server";
import { computeScore } from "@/lib/zioshield/scoring";

export async function POST(request: NextRequest) {
  const { phone, orgId, excludeOrderId } = await request.json();
  if (!phone || !orgId) {
    return NextResponse.json({ error: "phone and orgId required" }, { status: 400 });
  }
  const result = await computeScore(phone, orgId, excludeOrderId);
  return NextResponse.json(result);
}

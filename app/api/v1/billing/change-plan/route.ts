import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { changePlan } from "@/services/subscription.service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getOrgFromUserId(session.user.id);
    if (!orgId) {
      return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
    }

    const { planName } = await req.json();
    if (!planName) {
      return NextResponse.json({ success: false, error: "Plan name required" }, { status: 400 });
    }

    const result = await changePlan(orgId, planName);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, payUrl: result.payUrl, paymentRef: result.paymentRef, planName: result.planName });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

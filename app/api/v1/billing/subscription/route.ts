import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getSubscription, getUsage } from "@/services/subscription.service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getOrgFromUserId(session.user.id);
    if (!orgId) {
      return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
    }

    const [subscription, usage] = await Promise.all([
      getSubscription(orgId),
      getUsage(orgId),
    ]);

    return NextResponse.json({ success: true, subscription, usage });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

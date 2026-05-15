import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getConnectionStatus } from "@/services/whatsapp-connection.service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 404 });
  }

  const status = await getConnectionStatus(orgId);
  return NextResponse.json(status);
}

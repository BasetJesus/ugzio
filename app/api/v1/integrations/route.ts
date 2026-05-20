import { NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { getIntegrations, getIntegrationCount } from "@/services/integrations/base-integration.service";

export async function GET() {
  try {
    const { orgId } = await requireSession();
    const [integrations, count] = await Promise.all([
      getIntegrations(orgId),
      getIntegrationCount(orgId),
    ]);
    return NextResponse.json({ integrations, activeCount: count });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

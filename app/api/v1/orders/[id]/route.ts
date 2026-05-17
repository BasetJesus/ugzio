import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { transitionOrderStatus } from "@/services/order.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = await requireSession();
    const { id } = await params;
    const body = await request.json();
    const { status: newStatus } = body;

    if (!newStatus) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    const result = await transitionOrderStatus(orgId, id, newStatus);
    if (!result.success) {
      return NextResponse.json({ error: "Transition failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: result.id, status: result.status });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    if (e instanceof Error && e.message.startsWith("Invalid transition")) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import {
  approveUgcItem,
  rejectUgcItem,
} from "@/services/grow.service";
import { ugcActionSchema, formatZodErrors } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = await requireSession();
    const { id: itemId } = await params;

    const body = await request.json();
    const parsed = ugcActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const { action } = parsed.data;

    if (action === "approve") {
      const result = await approveUgcItem(orgId, itemId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, status: "approved" });
    }

    if (action === "reject") {
      const result = await rejectUgcItem(orgId, itemId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, status: "rejected" });
    }

    return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'." }, { status: 400 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    console.error("[ugc PATCH] error:", e);
    return NextResponse.json({ error: "Failed to update UGC item" }, { status: 500 });
  }
}

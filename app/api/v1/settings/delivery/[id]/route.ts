import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import {
  updateDeliveryProvider,
  deleteDeliveryProvider,
} from "@/services/delivery-provider.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = await requireSession();
    const { id: providerId } = await params;

    const body = await request.json();

    const result = await updateDeliveryProvider(orgId, providerId, {
      name: body.name,
      rtsCostPerFailure: body.rtsCostPerFailure,
      avgDeliveryDays: body.avgDeliveryDays,
      contactSuccessRate: body.contactSuccessRate,
      isDefault: body.isDefault,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    console.error("[delivery API PATCH] error:", e);
    return NextResponse.json({ error: "Failed to update provider" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = await requireSession();
    const { id: providerId } = await params;

    const result = await deleteDeliveryProvider(orgId, providerId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    console.error("[delivery API DELETE] error:", e);
    return NextResponse.json({ error: "Failed to delete provider" }, { status: 500 });
  }
}

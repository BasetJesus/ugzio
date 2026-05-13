import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import {
  getDeliveryProviders,
  createDeliveryProvider,
} from "@/services/delivery-provider.service";

export async function GET() {
  try {
    const { orgId } = await requireSession();
    const providers = await getDeliveryProviders(orgId);
    return NextResponse.json({ providers });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    console.error("[delivery API GET] error:", e);
    return NextResponse.json({ error: "Failed to load providers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireSession();

    const body = await request.json();
    const { name, rtsCostPerFailure, avgDeliveryDays, contactSuccessRate } = body;

    const result = await createDeliveryProvider(orgId, {
      name,
      rtsCostPerFailure,
      avgDeliveryDays,
      contactSuccessRate,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    console.error("[delivery API POST] error:", e);
    return NextResponse.json({ error: "Failed to create provider" }, { status: 500 });
  }
}

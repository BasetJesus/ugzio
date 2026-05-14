import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import {
  updateTemplate,
  deleteTemplate,
} from "@/services/ugc-template.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = await requireSession();
    const { id: templateId } = await params;

    const body = await request.json();

    const result = await updateTemplate(orgId, templateId, {
      name: body.name,
      requestType: body.requestType,
      messageBody: body.messageBody,
      incentive: body.incentive,
      isActive: body.isActive,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    console.error("[ugc-templates API PATCH] error:", e);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = await requireSession();
    const { id: templateId } = await params;

    const result = await deleteTemplate(orgId, templateId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    console.error("[ugc-templates API DELETE] error:", e);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

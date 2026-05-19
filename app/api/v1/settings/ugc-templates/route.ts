import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import {
  getTemplates,
  createTemplate,
} from "@/services/ugc-template.service";
import { ugcTemplateSchema, formatZodErrors } from "@/lib/validation";

export async function GET() {
  try {
    const { orgId } = await requireSession();
    const templates = await getTemplates(orgId);
    return NextResponse.json({ templates });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    console.error("[ugc-templates API GET] error:", e);
    return NextResponse.json({ error: "Failed to load templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireSession();

    const body = await request.json();
    const parsed = ugcTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const { name, body: messageBody } = parsed.data;

    const result = await createTemplate(orgId, {
      name,
      messageBody,
      requestType: body.requestType,
      incentive: body.incentive,
      isActive: body.isActive,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    console.error("[ugc-templates API POST] error:", e);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

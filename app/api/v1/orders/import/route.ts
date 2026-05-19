import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { validateCSV, importOrdersFromCSV, ImportResult } from "@/services/order-import.service";
import { checkFreePlanLimit } from "@/services/order.service";

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireSession();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const content = await file.text();

    const validation = await validateCSV(content);
    if (!validation.valid) {
      return NextResponse.json({
        error: "Validation failed",
        validation: {
          valid: false,
          rowCount: validation.rowCount,
          errors: validation.errors,
        },
      }, { status: 400 });
    }

    const limitReached = await checkFreePlanLimit(orgId);
    if (limitReached) {
      return NextResponse.json(
        { error: "Limite mensuelle atteinte. Passe à ZioGrow (29 TND/mois) ou ZioPro (79 TND/mois)." },
        { status: 403 },
      );
    }

    const result: ImportResult = await importOrdersFromCSV(orgId, content);

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    console.error("[import API] error:", e);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

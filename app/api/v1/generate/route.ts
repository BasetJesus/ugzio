import { NextResponse } from "next/server";
import { requireSession } from "@/services/auth.service";
import { generateCaptionSchema, formatZodErrors } from "@/lib/validation";
import { generateCaptions, getOrgCaptionProfile } from "@/services/caption.service";

export async function POST(req: Request) {
  try {
    const session = await requireSession();

    const body = await req.json();
    const parsed = generateCaptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const {
      topic,
      tone = "calm",
      platform = "instagram",
      price = "",
      link,
      brand: reqBrand,
    } = parsed.data;

    const savedProfile = reqBrand ? null : await getOrgCaptionProfile(session.orgId);
    const brand = reqBrand ?? savedProfile ?? undefined;

    const result = await generateCaptions({
      topic,
      tone,
      platform,
      price,
      link,
      brand: brand ? { niche: brand.niche ?? "", audience: brand.audience ?? "", brandTone: brand.brandTone ?? "funny_close", usp: brand.usp ?? "" } : undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate captions" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await requireSession();
    const profile = await getOrgCaptionProfile(session.orgId);
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ profile: null });
  }
}

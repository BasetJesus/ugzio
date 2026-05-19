import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/services/org.service";
import { registerSchema, formatZodErrors } from "@/lib/validation";

const REGISTER_RATE_LIMIT = 5;
const registerAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRegisterRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = registerAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    registerAttempts.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= REGISTER_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRegisterRateLimit(ip)) {
      return NextResponse.json({ error: "Trop de comptes créés depuis cette adresse. Réessayez plus tard." }, { status: 429 });
    }
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const result = await registerUser(name, email, password);
    if (!result.success) {
      const status = result.error === "Email already registered" ? 409 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true, userId: result.userId, orgId: result.orgId });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

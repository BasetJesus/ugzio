import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { getUserByEmail } from "@/services/org.service";
import { loginSchema, formatZodErrors } from "@/lib/validation";

const LOGIN_RATE_LIMIT = 10;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= LOGIN_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkLoginRateLimit(ip)) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });
    }
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const user = await getUserByEmail(email);
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const maxAge = 30 * 24 * 60 * 60;

    const token = {
      name: user.name,
      email: user.email,
      sub: user.id,
      id: user.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + maxAge,
      jti: crypto.randomUUID(),
    };

    const encodedToken = await encode({ secret, token, maxAge });

    const response = NextResponse.json({ success: true });

    const secure = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
    const prefix = secure ? "__Secure-" : "";
    const cookieName = `${prefix}next-auth.session-token`;

    response.cookies.set(cookieName, encodedToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge,
      secure,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

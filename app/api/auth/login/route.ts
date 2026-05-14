import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
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

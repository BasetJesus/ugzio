import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for webhooks and auth endpoints
  if (
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/generate"
  ) {
    return NextResponse.next();
  }

  // Edge-safe JWT validation — no Prisma
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|auth|_next/static|_next/image|favicon.ico|public).*)"],
};

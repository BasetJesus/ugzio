import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })

  const secure = process.env.NODE_ENV === "production"

  response.cookies.set("next-auth.session-token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  })

  if (secure) {
    response.cookies.set("__Secure-next-auth.session-token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    })
  }

  return response
}

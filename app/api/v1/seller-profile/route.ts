import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getSellerProfile, updateSellerProfile } from "@/services/seller-profile.service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 404 });
  }

  const profile = await getSellerProfile(orgId);
  return NextResponse.json(profile);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 404 });
  }

  const body = await request.json();
  const result = await updateSellerProfile(orgId, body);
  if (!result.success) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { createOrganization, updateOrganization, generateSampleData } from "@/services/org.service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let orgId = await getOrgFromUserId(session.user.id);
  const body = await request.json();
  const { shopName, sellerPhone, generateSample } = body;

  if (!shopName) {
    return NextResponse.json({ error: "shopName is required" }, { status: 400 });
  }

  let sampleData = null;

  if (!orgId) {
    const org = await createOrganization(shopName, session.user.id, sellerPhone);
    orgId = org.id;
  } else {
    await updateOrganization(orgId, { name: shopName, sellerPhone, sellerName: shopName });
  }

  if (generateSample) {
    sampleData = await generateSampleData(orgId);
  }

  return NextResponse.json({
    success: true,
    orgId,
    sampleData,
  });
}

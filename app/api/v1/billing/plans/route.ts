import { NextResponse } from "next/server";
import { getAllPlans } from "@/services/subscription.service";

export async function GET() {
  try {
    const plans = await getAllPlans();
    return NextResponse.json({ success: true, plans });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

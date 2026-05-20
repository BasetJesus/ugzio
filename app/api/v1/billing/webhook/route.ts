import { NextResponse } from "next/server";
import { handlePaymentWebhook } from "@/services/subscription.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentRef = searchParams.get("payment_ref");
    if (!paymentRef) {
      return NextResponse.json({ success: false, error: "Missing payment_ref" }, { status: 400 });
    }

    const result = await handlePaymentWebhook(paymentRef);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ success: false, error: "Webhook error" }, { status: 500 });
  }
}

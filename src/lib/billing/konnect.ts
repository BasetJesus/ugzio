const KONNECT_BASE = process.env.KONNECT_ENV === "production"
  ? "https://api.konnect.network/api/v2"
  : "https://api.sandbox.konnect.network/api/v2";

const WALLET_ID = process.env.KONNECT_WALLET_ID ?? "";
const API_KEY = process.env.KONNECT_API_KEY ?? "";

export interface KonnectInitResponse {
  payUrl: string;
  paymentRef: string;
}

export interface KonnectPaymentDetails {
  payment: {
    status: "pending" | "completed" | "failed" | "canceled";
    transaction: { status: "pending" | "success" | "failed" } | null;
    amount: number;
    currency: string;
    orderId?: string;
  };
}

function tndToMillimes(amount: number): number {
  return Math.round(amount * 1000);
}

export async function initPayment(opts: {
  amount: number;
  description: string;
  orderId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  webhook: string;
}): Promise<KonnectInitResponse> {
  const res = await fetch(`${KONNECT_BASE}/payments/init-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      receiverWalletId: WALLET_ID,
      token: "TND",
      amount: tndToMillimes(opts.amount),
      type: "immediate",
      description: opts.description,
      acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
      lifespan: 30,
      checkoutForm: true,
      addPaymentFeesToAmount: true,
      firstName: opts.firstName ?? "",
      lastName: opts.lastName ?? "",
      phoneNumber: opts.phoneNumber ?? "",
      email: opts.email ?? "",
      orderId: opts.orderId,
      webhook: opts.webhook,
      theme: "dark",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Konnect initPayment failed (${res.status}): ${body}`);
  }

  return res.json();
}

export async function getPaymentStatus(paymentRef: string): Promise<KonnectPaymentDetails> {
  const res = await fetch(`${KONNECT_BASE}/payments/${paymentRef}`, {
    headers: { "x-api-key": API_KEY },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Konnect getPaymentStatus failed (${res.status}): ${body}`);
  }

  return res.json();
}

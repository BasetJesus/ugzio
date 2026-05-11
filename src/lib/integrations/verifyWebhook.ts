import crypto from "crypto";

type Provider = "stripe" | "meta" | "shopify";

const SECRET_MAP: Record<Provider, string | undefined> = {
  stripe: process.env.STRIPE_WEBHOOK_SECRET,
  meta: process.env.META_WEBHOOK_VERIFY_TOKEN,
  shopify: process.env.STRIPE_WEBHOOK_SECRET, // Shopify uses its own HMAC secret
};

export function verifyWebhookSignature(
  provider: Provider,
  payload: string,
  signature: string,
): boolean {
  const secret = SECRET_MAP[provider];
  if (!secret) return false;

  switch (provider) {
    case "stripe": {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    }
    case "meta": {
      return signature === secret;
    }
    case "shopify": {
      const digest = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("base64");
      return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    }
  }
}

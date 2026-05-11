type Provider = "meta";

const SECRET_MAP: Record<Provider, string | undefined> = {
  meta: process.env.META_WEBHOOK_VERIFY_TOKEN,
};

export function verifyWebhookSignature(
  provider: Provider,
  payload: string,
  signature: string,
): boolean {
  const secret = SECRET_MAP[provider];
  if (!secret) return false;

  switch (provider) {
    case "meta": {
      return signature === secret;
    }
  }
}

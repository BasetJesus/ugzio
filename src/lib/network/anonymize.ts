import crypto from "crypto";

export function computeAnonymizedId(phoneE164: string): string {
  const salt = process.env.NETWORK_SALT || process.env.NEXTAUTH_SECRET;
  if (!salt) {
    console.warn("[anonymize] No NETWORK_SALT or NEXTAUTH_SECRET set — using unsafe fallback");
    return crypto.createHash("sha256").update(phoneE164).digest("hex");
  }
  return crypto.createHmac("sha256", salt).update(phoneE164).digest("hex");
}

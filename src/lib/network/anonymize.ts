import crypto from "crypto";

export function computeAnonymizedId(phoneE164: string): string {
  const salt = process.env.NETWORK_SALT;
  if (!salt) throw new Error("NETWORK_SALT not set");
  return crypto.createHmac("sha256", salt).update(phoneE164).digest("hex");
}

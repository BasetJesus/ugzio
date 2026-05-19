import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for state signing");
  return secret;
}

export function signState(payload: string): string {
  const secret = getSecret();
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}:${hmac}`;
}

export function verifyState(signed: string): string | null {
  const separator = signed.lastIndexOf(":");
  if (separator === -1) return null;

  const payload = signed.slice(0, separator);
  const signature = signed.slice(separator + 1);

  const secret = getSecret();
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }

  return payload;
}

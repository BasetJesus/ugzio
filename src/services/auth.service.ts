import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getOrgFromUserId } from "@/lib/billing/enforce";

export interface SessionContext {
  userId: string;
  orgId: string;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new AuthError("Unauthorized");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) throw new AuthError("No organization");

  return { userId: session.user.id, orgId };
}

export async function trySession(): Promise<SessionContext | null> {
  try {
    return await requireSession();
  } catch {
    return null;
  }
}

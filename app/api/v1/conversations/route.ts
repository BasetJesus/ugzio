import { NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { listConversations } from "@/services/conversation.service";

export async function GET() {
  try {
    const { orgId } = await requireSession();
    const conversations = await listConversations(orgId);
    return NextResponse.json(conversations);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

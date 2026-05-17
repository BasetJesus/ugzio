import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { addNote } from "@/services/conversation.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId, userId } = await requireSession();
    const { id } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const note = await addNote(orgId, id, userId, content);
    if (!note) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json(note, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

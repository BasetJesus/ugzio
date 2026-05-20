import { prisma } from "@/lib/db";

export async function listConversations(orgId: string) {
  try {
    return await prisma.conversation.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        order: { select: { trustScore: true, status: true } },
        messages: { select: { id: true, direction: true, content: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  } catch {
    return [];
  }
}

export async function getConversation(orgId: string, conversationId: string) {
  try {
    return await prisma.conversation.findFirst({
      where: { id: conversationId, organizationId: orgId },
      include: {
        order: true,
        messages: { orderBy: { createdAt: "asc" } },
        notes: { orderBy: { createdAt: "desc" } },
      },
    });
  } catch {
    return null;
  }
}

export async function addNote(orgId: string, conversationId: string, authorId: string, content: string) {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, organizationId: orgId },
    });
    if (!conversation) return null;

    return await prisma.internalNote.create({
      data: { conversationId, authorId, content },
    });
  } catch {
    return null;
  }
}

export async function getConversationCount(orgId: string): Promise<number> {
  try {
    return await prisma.conversation.count({
      where: { organizationId: orgId },
    });
  } catch {
    return 0;
  }
}

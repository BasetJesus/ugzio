import { prisma } from "@/lib/db";

export async function listConversations(orgId: string) {
  return prisma.conversation.findMany({
    where: { organizationId: orgId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      order: { select: { trustScore: true, status: true } },
      messages: { select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export async function getConversation(orgId: string, conversationId: string) {
  return prisma.conversation.findFirst({
    where: { id: conversationId, organizationId: orgId },
    include: {
      order: true,
      messages: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function addNote(orgId: string, conversationId: string, authorId: string, content: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, organizationId: orgId },
  });
  if (!conversation) return null;

  return prisma.internalNote.create({
    data: { conversationId, authorId, content },
  });
}

export async function getConversationCount(orgId: string): Promise<number> {
  return prisma.conversation.count({
    where: { organizationId: orgId },
  });
}

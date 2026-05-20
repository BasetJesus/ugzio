import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { listConversations } from "@/services/conversation.service";
import ZioInboxClient from "./ZioInboxClient";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const conversations = await listConversations(orgId).catch(() => []);

  const serialized = conversations.map((c) => ({
    id: c.id,
    buyerName: c.buyerName,
    buyerPhone: c.buyerPhone,
    orderId: c.orderId,
    createdAt: c.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: c.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    order: c.order ? { trustScore: c.order.trustScore, status: c.order.status } : null,
    messages: (c.messages ?? []).map((m) => ({
      id: m.id,
      direction: m.direction,
      content: m.content,
      createdAt: m.createdAt?.toISOString?.() ?? new Date().toISOString(),
    })),
  }));

  return <ZioInboxClient initialConversations={serialized} />;
}

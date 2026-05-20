import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getServerLang, st } from "@/lib/core/server-lang";
import CaptionGenerator from "@/components/grow/CaptionGenerator";

export const dynamic = "force-dynamic";

export default async function CaptionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();

  return (
    <div data-state="live" className="space-y-section">
      <h1 className="text-display text-[var(--text-primary)]">{st(lang, "captions.title")}</h1>
      <CaptionGenerator />
    </div>
  );
}

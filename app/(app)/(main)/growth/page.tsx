import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getGrowthMetrics } from "@/services/growth.service";
import { getServerLang } from "@/lib/core/server-lang";
import GrowthDashboardClient from "@/components/grow/GrowthDashboardClient";

export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  const lang = await getServerLang();
  const L = { title: { ar: "النمو", fr: "Croissance", en: "Growth" } }
  const l = (key: string) => (L as any)[key]?.[lang] ?? key

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const metrics = await getGrowthMetrics(orgId);

  return (
    <div data-state="live" className="space-y-section">
      <h1 className="text-display text-[var(--text-primary)]">{l("title")}</h1>
      <GrowthDashboardClient metrics={metrics} />
    </div>
  );
}

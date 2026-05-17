import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import UgcTemplateSettingsClient from "@/components/settings/UgcTemplateSettingsClient";
import Link from "next/link";
import { getServerLang } from "@/lib/core/server-lang";

export const dynamic = "force-dynamic";

export default async function UgcSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();
  const L: Record<string, Record<string, string>> = {
    back: { ar: "→ العودة", fr: "← Retour au tableau de bord", en: "← Back to dashboard" },
    ugc_templates: { ar: "قوالب UGC", fr: "Modèles UGC", en: "UGC Templates" },
    configure_ugc_messages: { ar: "اضبط رسائل طلب المحتوى المرسلة للمشترين", fr: "Configure les messages de demande de contenu envoyés aux acheteurs", en: "Configure content request messages sent to buyers" },
  };
  function l(key: string): string {
    return L[key]?.[lang] ?? key
  }

  return (
    <div data-state="live" className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/overview"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {l("back")}
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{l("ugc_templates")}</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {l("configure_ugc_messages")}
        </p>
      </div>

      <UgcTemplateSettingsClient />
    </div>
  );
}

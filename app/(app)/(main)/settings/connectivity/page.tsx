import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import ConnectivitySettingsClient from "@/components/settings/ConnectivitySettingsClient";
import IntegrationsClient from "@/components/settings/IntegrationsClient";
import Link from "next/link";
import { getServerLang } from "@/lib/core/server-lang";

export const dynamic = "force-dynamic";

export default async function ConnectivitySettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();
  const L: Record<string, Record<string, string>> = {
    all_settings: { ar: "→ جميع الإعدادات", fr: "← Tous les paramètres", en: "← All settings" },
    connectivity: { ar: "الاتصال", fr: "Connectivité", en: "Connectivity" },
    configure_connectivity: { ar: "اضبط WhatsApp واتصالات API", fr: "Configure WhatsApp et les connexions API", en: "Configure WhatsApp and API connections" },
  };
  function l(key: string): string {
    return L[key]?.[lang] ?? key
  }

  return (
    <div data-state="live" className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {l("all_settings")}
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{l("connectivity")}</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{l("configure_connectivity")}</p>
      </div>

      <IntegrationsClient />
      <ConnectivitySettingsClient />
    </div>
  );
}

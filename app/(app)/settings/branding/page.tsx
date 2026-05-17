import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import BrandingSettingsClient from "@/components/settings/BrandingSettingsClient";
import Link from "next/link";
import { getServerLang } from "@/lib/core/server-lang";

export const dynamic = "force-dynamic";

export default async function BrandingSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();
  const L: Record<string, Record<string, string>> = {
    all_settings: { ar: "→ جميع الإعدادات", fr: "← Tous les paramètres", en: "← All settings" },
    brand: { ar: "العلامة التجارية", fr: "Marque", en: "Brand" },
    customize_branding: { ar: "خصص مظهر متجرك على رابط السحري", fr: "Personnalise l'apparence de ta boutique sur le magic link", en: "Customize your store's look on the magic link" },
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
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{l("brand")}</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{l("customize_branding")}</p>
      </div>

      <BrandingSettingsClient />
    </div>
  );
}

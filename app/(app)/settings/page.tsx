import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import Link from "next/link";
import { getServerLang } from "@/lib/core/server-lang";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { href: "/settings/delivery", labelKey: "settings.delivery", descKey: "settings.delivery-desc", icon: "🚚" },
  { href: "/settings/ugc", labelKey: "settings.ugc", descKey: "settings.ugc-desc", icon: "📸" },
  { href: "/settings/connectivity", labelKey: "settings.connectivity", descKey: "settings.connectivity-desc", icon: "🔌" },
  { href: "/settings/branding", labelKey: "settings.branding", descKey: "settings.branding-desc", icon: "🎨" },
  { href: "/settings/security", labelKey: "settings.security", descKey: "settings.security-desc", icon: "🔒" },
];

const LABELS: Record<string, Record<string, string>> = {
  "settings.title": { ar: "الإعدادات", fr: "Paramètres", en: "Settings" },
  "settings.desc": { ar: "قم بتكوين متجر UGZIO الخاص بك", fr: "Configure ta boutique UGZIO", en: "Configure your UGZIO store" },
  "settings.delivery": { ar: "التوصيل", fr: "Livraison", en: "Delivery" },
  "settings.delivery-desc": { ar: "شركات النقل، تكاليف RTS، المهل", fr: "Transporteurs, coûts RTS, délais", en: "Carriers, RTS costs, delays" },
  "settings.ugc": { ar: "محتوى UGC", fr: "Contenu UGC", en: "UGC Content" },
  "settings.ugc-desc": { ar: "قوالب رسائل المشترين", fr: "Modèles de messages pour les acheteurs", en: "Buyer message templates" },
  "settings.connectivity": { ar: "الاتصال", fr: "Connectivité", en: "Connectivity" },
  "settings.connectivity-desc": { ar: "WhatsApp، إعدادات API", fr: "WhatsApp, configurations API", en: "WhatsApp, API config" },
  "settings.branding": { ar: "العلامة التجارية", fr: "Marque", en: "Branding" },
  "settings.branding-desc": { ar: "الوصف، وسائل التواصل الاجتماعي، الهوية", fr: "Description, réseaux sociaux, identité", en: "Description, social links, identity" },
  "settings.security": { ar: "الأمان", fr: "Sécurité", en: "Security" },
  "settings.security-desc": { ar: "كلمة المرور، المصادقة الثنائية، البيانات", fr: "Mot de passe, 2FA, données", en: "Password, 2FA, data" },
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();

  function l(key: string): string {
    return LABELS[key]?.[lang] ?? key;
  }

  return (
    <div data-state="live" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{l("settings.title")}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{l("settings.desc")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent)]/50 transition-colors"
          >
            <div className="text-2xl mb-2">{cat.icon}</div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{l(cat.labelKey)}</h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{l(cat.descKey)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import DeliverySettingsClient from "@/components/settings/DeliverySettingsClient";
import Link from "next/link";
import { getServerLang } from "@/lib/core/server-lang";

export const dynamic = "force-dynamic";

export default async function DeliverySettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();
  const L: Record<string, Record<string, string>> = {
    back: { ar: "→ العودة", fr: "← Retour au tableau de bord", en: "← Back to dashboard" },
    settings: { ar: "الإعدادات", fr: "Paramètres", en: "Settings" },
    configure_delivery_costs: { ar: "اضبط تكاليف التوصيل", fr: "Configure tes coûts de livraison", en: "Configure your delivery costs" },
    active: { ar: "نشط", fr: "Actif", en: "Active" },
    carriers: { ar: "شركات النقل", fr: "Transporteurs", en: "Carriers" },
    import: { ar: "استيراد", fr: "Import", en: "Import" },
    csv_orders: { ar: "طلبات CSV", fr: "Commandes CSV", en: "CSV Orders" },
    content: { ar: "المحتوى", fr: "Contenu", en: "Content" },
    ugc_templates: { ar: "قوالب UGC", fr: "Modèles UGC", en: "UGC Templates" },
  };
  function l(key: string): string {
    return L[key]?.[lang] ?? key
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link
          href="/overview"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {l("back")}
          </Link>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-4 py-3">
          <p className="text-[10px] text-[var(--accent)] uppercase tracking-wider font-medium">{l("active")}</p>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">{l("carriers")}</p>
        </div>
        <Link
          href="/orders/import"
          className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] px-4 py-3 hover:border-[var(--border)]/70 transition-colors"
        >
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">{l("import")}</p>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">{l("csv_orders")}</p>
        </Link>
        <Link
          href="/settings/ugc"
          className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] px-4 py-3 hover:border-[var(--border)]/70 transition-colors"
        >
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">{l("content")}</p>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">{l("ugc_templates")}</p>
        </Link>
      </div>

      <DeliverySettingsClient />
    </div>
  );
}

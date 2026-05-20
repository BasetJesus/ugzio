import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getServerLang } from "@/lib/core/server-lang";
import OrderImportPanel from "@/components/orders/OrderImportPanel";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrdersImportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();

  const L: Record<string, Record<string, string>> = {
    back: { ar: "→ العودة إلى الطلبات", fr: "← Retour aux commandes", en: "← Back to orders" },
    title: { ar: "استيراد الطلبات", fr: "Importer des commandes", en: "Import orders" },
    desc: { ar: "ربط طلباتك الحالية بـ UGZIO", fr: "Connecte tes commandes existantes à UGZIO", en: "Connect your existing orders to UGZIO" },
    csvGuide: { ar: "دليل تنسيق CSV", fr: "Guide du format CSV", en: "CSV format guide" },
    col: { ar: "العمود", fr: "Colonne", en: "Column" },
    required: { ar: "مطلوب", fr: "Requis", en: "Required" },
    example: { ar: "مثال", fr: "Exemple", en: "Example" },
    notes: { ar: "ملاحظات", fr: "Notes", en: "Notes" },
    yes: { ar: "نعم", fr: "Oui", en: "Yes" },
    recommended: { ar: "موصى به", fr: "Recommandé", en: "Recommended" },
    customerNameNote: { ar: "الاسم الكامل للعميل", fr: "Nom complet du client", en: "Customer full name" },
    phoneNote: { ar: "رقم الهاتف", fr: "Numéro de téléphone", en: "Phone number" },
    amountNote: { ar: "المبلغ بـ TND", fr: "Montant en TND", en: "Amount in TND" },
    cityNote: { ar: "ولاية/مدينة التوصيل", fr: "Ville/wilaya de livraison", en: "Delivery city/governorate" },
    productNote: { ar: "اسم المنتج", fr: "Nom du produit", en: "Product name" },
    providerNote: { ar: "اسم شركة التوصيل", fr: "Nom du transporteur", en: "Delivery provider name" },
  };
  function l(key: string): string { return L[key]?.[lang] ?? key }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {l("back")}
          </Link>
        </div>

      <OrderImportPanel />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{l("csvGuide")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">{l("col")}</th>
                <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">{l("required")}</th>
                <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">{l("example")}</th>
                <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">{l("notes")}</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 font-mono">customerName</td>
                <td className="py-2 px-3 text-green-400">{l("yes")}</td>
                <td className="py-2 px-3">Ahmed Ben Ali</td>
                <td className="py-2 px-3">{l("customerNameNote")}</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 font-mono">phone</td>
                <td className="py-2 px-3 text-green-400">{l("yes")}</td>
                <td className="py-2 px-3">+216 55 123 456</td>
                <td className="py-2 px-3">{l("phoneNote")}</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 font-mono">amount</td>
                <td className="py-2 px-3 text-green-400">{l("yes")}</td>
                <td className="py-2 px-3">89.99</td>
                <td className="py-2 px-3">{l("amountNote")}</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 font-mono">city</td>
                <td className="py-2 px-3 text-green-400">{l("yes")}</td>
                <td className="py-2 px-3">Tunis</td>
                <td className="py-2 px-3">{l("cityNote")}</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 font-mono">product</td>
                <td className="py-2 px-3 text-green-400">{l("yes")}</td>
                <td className="py-2 px-3">Wireless Earbuds Pro</td>
                <td className="py-2 px-3">{l("productNote")}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">deliveryProvider</td>
                <td className="py-2 px-3 text-amber-400">{l("recommended")}</td>
                <td className="py-2 px-3">Aramex</td>
                <td className="py-2 px-3">{l("providerNote")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

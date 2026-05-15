import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import OrderImportPanel from "@/components/orders/OrderImportPanel";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrdersImportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  return (
    <div data-state="history" className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          ← Retour aux commandes
          </Link>
        </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Importer des commandes</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Connecte tes commandes existantes à UGZIO</p>
      </div>

      <OrderImportPanel />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Guide du format CSV</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">Colonne</th>
                <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">Requis</th>
                <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">Exemple</th>
                <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 font-mono">customerName</td>
                <td className="py-2 px-3 text-green-400">Oui</td>
                <td className="py-2 px-3">Ahmed Ben Ali</td>
                <td className="py-2 px-3">Nom complet du client</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 font-mono">phone</td>
                <td className="py-2 px-3 text-green-400">Oui</td>
                <td className="py-2 px-3">+216 55 123 456</td>
                <td className="py-2 px-3">Numéro de téléphone</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 font-mono">amount</td>
                <td className="py-2 px-3 text-green-400">Oui</td>
                <td className="py-2 px-3">89.99</td>
                <td className="py-2 px-3">Montant en TND</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 font-mono">city</td>
                <td className="py-2 px-3 text-green-400">Oui</td>
                <td className="py-2 px-3">Tunis</td>
                <td className="py-2 px-3">Ville/wilaya de livraison</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 font-mono">product</td>
                <td className="py-2 px-3 text-green-400">Oui</td>
                <td className="py-2 px-3">Wireless Earbuds Pro</td>
                <td className="py-2 px-3">Nom du produit</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">deliveryProvider</td>
                <td className="py-2 px-3 text-amber-400">Recommandé</td>
                <td className="py-2 px-3">Aramex</td>
                <td className="py-2 px-3">Nom du transporteur</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

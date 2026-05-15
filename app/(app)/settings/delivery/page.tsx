import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import DeliverySettingsClient from "@/components/settings/DeliverySettingsClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DeliverySettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  return (
    <div data-state="live" className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/overview"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          ← Retour au tableau de bord
          </Link>
        </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Paramètres</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Configure tes coûts de livraison</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-4 py-3">
          <p className="text-[10px] text-[var(--accent)] uppercase tracking-wider font-medium">Actif</p>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">Transporteurs</p>
        </div>
        <Link
          href="/orders/import"
          className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] px-4 py-3 hover:border-[var(--border)]/70 transition-colors"
        >
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Import</p>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">Commandes CSV</p>
        </Link>
        <Link
          href="/settings/ugc"
          className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] px-4 py-3 hover:border-[var(--border)]/70 transition-colors"
        >
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Contenu</p>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">Modèles UGC</p>
        </Link>
      </div>

      <DeliverySettingsClient />
    </div>
  );
}

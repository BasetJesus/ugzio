import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import BrandingSettingsClient from "@/components/settings/BrandingSettingsClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BrandingSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  return (
    <div data-state="live" className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          ← Tous les paramètres
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Marque</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Personnalise l&apos;apparence de ta boutique sur le magic link</p>
      </div>

      <BrandingSettingsClient />
    </div>
  );
}

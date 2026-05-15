import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  {
    href: "/settings/delivery",
    label: "Livraison",
    desc: "Transporteurs, coûts RTS, délais",
    icon: "🚚",
  },
  {
    href: "/settings/ugc",
    label: "Contenu UGC",
    desc: "Modèles de messages pour les acheteurs",
    icon: "📸",
  },
  {
    href: "/settings/connectivity",
    label: "Connectivité",
    desc: "WhatsApp, configurations API",
    icon: "🔌",
  },
  {
    href: "/settings/branding",
    label: "Marque",
    desc: "Description, réseaux sociaux, identité",
    icon: "🎨",
  },
];

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  return (
    <div data-state="live" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Paramètres</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Configure ta boutique UGZIO</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 hover:border-[var(--accent)]/50 transition-colors"
          >
            <div className="text-2xl mb-2">{cat.icon}</div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{cat.label}</h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{cat.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

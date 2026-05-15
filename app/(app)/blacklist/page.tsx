import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import BlacklistClient from "@/components/shared/BlacklistClient";

export const dynamic = "force-dynamic";

export default async function BlacklistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  return (
    <div data-state="live" className="space-y-section">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-[var(--text-primary)]">Liste noire</h1>
      </div>
      <p className="text-sm text-[var(--text-secondary)] -mt-4">
        Les numéros sur liste noire seront bloqués à la création de commande
      </p>
      <BlacklistClient />
    </div>
  );
}

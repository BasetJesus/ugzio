import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import BlacklistClient from "@/components/shared/BlacklistClient";
import { getServerLang, st } from "@/lib/core/server-lang";

export const dynamic = "force-dynamic";

export default async function BlacklistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();

  return (
    <div className="flex flex-col gap-5">
      <BlacklistClient />
    </div>
  );
}

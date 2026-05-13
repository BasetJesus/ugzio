import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { registerCoreSubscribers } from "@/lib/events/subscribers";
import SidebarNav from "@/components/shared/SidebarNav";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import LanguageToggle from "@/components/shared/LanguageToggle";

registerCoreSubscribers();

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { subscription: { include: { plan: true } } },
  });

  const events = await prisma.activationEvent.findMany({
    where: { organizationId: orgId },
  });
  const completedCount = events.length;

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl pb-16 sm:pb-0">
      <SidebarNav
        orgName={org?.name ?? ""}
        planName={org?.subscription?.plan?.name ?? "free"}
        orgId={orgId}
        completedCount={completedCount}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <MobileBottomNav />
      <div className="fixed bottom-20 right-4 z-50 sm:bottom-4">
        <LanguageToggle />
      </div>
    </div>
  );
}

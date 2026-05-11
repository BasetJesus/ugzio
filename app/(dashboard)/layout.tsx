import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import Link from "next/link";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/orders/new", label: "+ New Order" },
  { href: "/inbox", label: "Inbox" },
  { href: "/shield", label: "ZioShield" },
  { href: "/confirm", label: "ZioConfirm" },
  { href: "/success", label: "Success" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

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
  const showOnboarding = completedCount < 4;

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl">
      <aside className="hidden w-56 border-r border-zinc-800 p-4 sm:flex sm:flex-col">
        <div className="mb-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
              UGZIO
            </span>
          </Link>
          {org && (
            <p className="mt-1 truncate text-xs text-zinc-600">
              {org.name} · {org.subscription?.plan?.name ?? "starter"}
            </p>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {showOnboarding && (
          <div className="mt-auto pt-4 border-t border-zinc-800">
            <Link
              href="/onboarding"
              className="block rounded-lg bg-purple-600/20 px-3 py-2 text-xs font-semibold text-purple-400 transition hover:bg-purple-600/30"
            >
              Onboarding ({completedCount}/4)
            </Link>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

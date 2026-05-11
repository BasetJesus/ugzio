import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STEPS = [
  { id: "FIRST_ORDER_CREATED", label: "Créez votre première commande", href: "/orders/new" },
  { id: "FIRST_TRUST_SCORE", label: "Analysez le score de confiance", href: "/shield" },
  { id: "FIRST_VERIFICATION_SENT", label: "Envoyez une vérification WhatsApp", href: "/confirm" },
  { id: "FIRST_HIGH_RISK_BLOCKED", label: "Bloquez une commande à risque", href: "/shield" },
] as const;

export default async function OnboardingChecklist() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const events = await prisma.activationEvent.findMany({
    where: { organizationId: orgId },
  });

  const completedEventTypes = new Set(events.map((e) => e.eventType));
  const completedCount = STEPS.filter((s) => completedEventTypes.has(s.id)).length;
  const totalSteps = STEPS.length;
  const progress = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="mx-auto max-w-lg p-4 sm:p-0">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h1 className="text-xl font-bold text-white">Bienvenue sur UGZIO</h1>
        <p className="mt-1 text-sm text-zinc-400">Objectif: Prévenir votre première commande risquée</p>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Progression</span>
            <span>{completedCount}/{totalSteps}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {STEPS.map((step) => {
            const done = completedEventTypes.has(step.id);
            return (
              <Link
                key={step.id}
                href={step.href}
                className={`flex items-center gap-3 rounded-xl border p-4 transition ${
                  done
                    ? "border-green-900/30 bg-green-950/20"
                    : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                }`}
              >
                <span className={`text-lg ${done ? "text-green-400" : "text-zinc-600"}`}>
                  {done ? "✅" : "⬜"}
                </span>
                <span className={`text-sm font-medium ${done ? "text-green-300" : "text-zinc-300"}`}>
                  {step.label}
                </span>
              </Link>
            )
          })}
        </div>

        {completedCount === totalSteps && (
          <div className="mt-6 rounded-xl border border-purple-900/30 bg-purple-950/20 p-4 text-center">
            <p className="font-semibold text-purple-300">🎉 Toutes les étapes complétées!</p>
            <Link href="/" className="mt-2 inline-block text-sm text-purple-400 underline">
              Aller au tableau de bord
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

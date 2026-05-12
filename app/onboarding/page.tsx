import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import Link from "next/link";
import OnboardingSetupForm from "./OnboardingSetupForm";

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

  // No org yet — show setup form instead of checklist
  if (!orgId) {
    return <OnboardingSetupForm />;
  }

  const events = await prisma.activationEvent.findMany({
    where: { organizationId: orgId },
  });

  const completedEventTypes = new Set(events.map((e) => e.eventType));
  const completedCount = STEPS.filter((s) => completedEventTypes.has(s.id)).length;
  const totalSteps = STEPS.length;
  const progress = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="mx-auto max-w-lg p-4 sm:p-0">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Bienvenue sur UGZIO</h1>
        <p className="mt-1 text-sm text-zinc-500">Objectif: Prévenir votre première commande risquée</p>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>Progression</span>
            <span>{completedCount}/{totalSteps}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {STEPS.map((step) => {
            const done = completedEventTypes.has(step.id);
            return (
              <Link
                key={step.id}
                href={step.href}
                className={`flex items-center gap-3 rounded-md p-3 transition ${
                  done
                    ? "bg-green-500/5"
                    : "hover:bg-zinc-800/20"
                }`}
              >
                <span className={`text-lg ${done ? "" : "text-zinc-600"}`}>
                  {done ? "✅" : "⬜"}
                </span>
                <span className={`text-sm font-medium ${done ? "text-green-400" : "text-zinc-300"}`}>
                  {step.label}
                </span>
              </Link>
            )
          })}
        </div>

        {completedCount === totalSteps && (
          <div className="mt-6 rounded-md border border-green-900/30 bg-green-500/5 p-4 text-center">
            <p className="font-semibold text-green-400">🎉 Toutes les étapes complétées!</p>
            <Link href="/" className="mt-2 inline-block text-sm text-green-400 underline">
              Aller au tableau de bord
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

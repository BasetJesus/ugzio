const sequences = [
  {
    icon: "🤝",
    title: "Réassurance",
    goal: "Bâtir la confiance",
    reason: "Premier achat • Client hésite",
    preview: "Salam [Name], votre commande est entre de bonnes mains. Plus de 500 clients satisfaits cette mois. On vous confirme?",
    outcome: "+40% taux de confirmation",
    color: "text-emerald-400",
    border: "border-emerald-500/15",
    bg: "bg-emerald-500/5",
    badgeBg: "bg-emerald-500/10",
  },
  {
    icon: "⚡",
    title: "Urgence",
    goal: "Créer l'action",
    reason: "Faux client • Non-réponse",
    preview: "Salam, votre commande de [montant] TND vous attend. Stock limité — confirmez maintenant pour éviter l'annulation.",
    outcome: "-60% fausses commandes",
    color: "text-amber-400",
    border: "border-amber-500/15",
    bg: "bg-amber-500/5",
    badgeBg: "bg-amber-500/10",
  },
  {
    icon: "🔔",
    title: "Rappel",
    goal: "Ramener l'attention",
    reason: "Client distrait • Pas de réponse",
    preview: "Salam [Name], on n'a pas eu de réponse. Votre colis de [montant] TND vous attend encore. Dernier rappel!",
    outcome: "+25% récupération",
    color: "text-blue-400",
    border: "border-blue-500/15",
    bg: "bg-blue-500/5",
    badgeBg: "bg-blue-500/10",
  },
  {
    icon: "🛡️",
    title: "Trust-Building",
    goal: "Fidéliser durablement",
    reason: "Client confirmé • Préparer prochaine vente",
    preview: "Salam [Name], merci d'avoir confirmé! Suivez votre livraison ici. À bientôt pour vos prochains achats.",
    outcome: "+70% retour client",
    color: "text-purple-400",
    border: "border-purple-500/15",
    bg: "bg-purple-500/5",
    badgeBg: "bg-purple-500/10",
  },
]

export default function PsychologySection() {
  return (
    <section className="relative px-5 py-20 sm:py-28">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl mb-12">
          <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-4">
            WhatsApp Psychology
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Mouch ay message.
          </h2>
          <p className="mt-4 text-sm text-white/40 leading-relaxed">
            كل client ياخو sequence مختلف حسب comportement mte3ou. UGZIO يقرر شنوّة يبعث ومتى.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sequences.map((s) => (
            <div
              key={s.title}
              className={`rounded-2xl border ${s.border} ${s.bg} p-5 transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{s.icon}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.badgeBg} ${s.color}`}>
                  {s.goal}
                </span>
              </div>

              <h3 className={`text-base font-bold ${s.color} mb-1`}>{s.title}</h3>
              <p className="text-xs text-white/40 mb-3">{s.reason}</p>

              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 mb-3 min-h-[72px]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-[9px] text-green-400/60 font-medium">Message Preview</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{s.preview}</p>
              </div>

              <div className="text-xs text-white/30">
                <span className={s.color}>{s.outcome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import RevealOnScroll from "./RevealOnScroll"

const sequences = [
  {
    icon: "🤝",
    title: "T2akkid",
    goal: "Yabni thiqa",
    reason: "Premier achat • Client متردد",
    preview: "Salam [Name], commande mte3ek fi ayedeen أمينة. Plus de 500 clients satisfaits هذا الشهر. Tconfirmlha?",
    outcome: "+40% taux de confirmation",
    color: "text-emerald-400",
    border: "border-emerald-500/15",
    bg: "bg-emerald-500/5",
    badgeBg: "bg-emerald-500/10",
  },
  {
    icon: "⚡",
    title: "T3ajil",
    goal: "Yjabbar action",
    reason: "Client suspect • Ma yjewbch",
    preview: "Salam, commande mte3ek [montant] TND t7ebsek. Stock limité — confirmi taw wala nannoulouha.",
    outcome: "-60% fausses commandes",
    color: "text-amber-400",
    border: "border-amber-500/15",
    bg: "bg-amber-500/5",
    badgeBg: "bg-amber-500/10",
  },
  {
    icon: "🔔",
    title: "Tadhkir",
    goal: "Yarja3 lik le client",
    reason: "Client nsitou • Ma radch",
    preview: "Salam [Name], mazelt ma radit. Colis mte3ek [montant] TND mazel y7ebsek. Dernier appel!",
    outcome: "+25% récupération",
    color: "text-blue-400",
    border: "border-blue-500/15",
    bg: "bg-blue-500/5",
    badgeBg: "bg-blue-500/10",
  },
  {
    icon: "🛡️",
    title: "Thiqa",
    goal: "Ykhalik mte3ek",
    reason: "Client confirmé • Wajjou lil vente li jeya",
    preview: "Salam [Name], merci 3la confirmation! Taba3 livraison mte3ek hné. Nchoufoukom fi prochaine commande.",
    outcome: "+70% retour client",
    color: "text-purple-400",
    border: "border-purple-500/15",
    bg: "bg-purple-500/5",
    badgeBg: "bg-purple-500/10",
  },
]

export default function PsychologySection() {
  return (
    <section className="relative section-padding">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="section-container">
        <RevealOnScroll>
          <div className="section-intro">
            <p className="section-intro-label">WhatsApp Intelligence</p>
            <h2 className="section-intro-title">Mouch ay message. كل واحد حسب state mte3ou.</h2>
            <p className="section-intro-desc">
              Client mertaa7? Client suspect? Client nsitou? كل واحد ياخو sequence يلي تناسبو. UGZIO يعرف شنوّة يبعث ومتى.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sequences.map((s, i) => (
            <RevealOnScroll key={s.title} delay={i * 100}>
              <div
                className={`rounded-2xl border ${s.border} ${s.bg} p-5 transition-all duration-300 hover:scale-[1.03] cursor-default`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{s.icon}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.badgeBg} ${s.color}`}>
                    {s.goal}
                  </span>
                </div>

                <h3 className={`text-base font-bold ${s.color} mb-1`}>{s.title}</h3>
                <p className="text-xs text-white/40 mb-3">{s.reason}</p>

                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 mb-3 min-h-[80px]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-[9px] text-green-400/60 font-medium">UGZIO • via WhatsApp</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{s.preview}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${s.color}`}>{s.outcome}</span>
                  <span className="text-[9px] text-white/20">WhatsApp-native</span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

import RevealOnScroll from "./RevealOnScroll"

const problems = [
  {
    icon: "📦",
    title: "Livraison qui revient",
    desc: "Vous pensiez la commande confirmee... 4 jours plus tard, elle revient.",
    loss: "15-25 TND par RTS",
    color: "text-red-400",
    border: "border-red-500/10",
    bg: "bg-red-500/5",
  },
  {
    icon: "📵",
    title: "Le client ne repond pas",
    desc: "3 appels. 2 messages. 0 reponse.",
    loss: "30-50 TND par commande",
    color: "text-amber-400",
    border: "border-amber-500/10",
    bg: "bg-amber-500/5",
  },
  {
    icon: "💸",
    title: "Les pubs brulent votre budget",
    desc: "Vous attirez des commandes... mais la marge disparait dans les RTS.",
    loss: "200-500 TND / mois",
    color: "text-purple-400",
    border: "border-purple-500/10",
    bg: "bg-purple-500/5",
  },
  {
    icon: "😵",
    title: "L'equipe est perdue",
    desc: "Qui a confirme ? Qui est risque ? Qui doit etre relance ? C'est le chaos.",
    loss: "Stress quotidien",
    color: "text-pink-400",
    border: "border-pink-500/10",
    bg: "bg-pink-500/5",
  },
]

export default function RealitySection() {
  return (
    <section className="relative section-padding">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="section-container">
        <RevealOnScroll>
          <div className="section-intro">
            <p className="section-intro-label">Assez</p>
            <h2 className="section-intro-title">Les memes problemes.</h2>
            <p className="section-intro-desc">
              Chaque jour la meme histoire. Fausses commandes, clients silencieux, marge qui fond. Il est temps de changer.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p, i) => (
            <RevealOnScroll key={p.title} delay={i * 100}>
              <div
                className={`rounded-2xl border ${p.border} ${p.bg} p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-default`}
              >
                <span className="text-2xl mb-4 block">{p.icon}</span>
                <h3 className={`text-sm font-bold ${p.color} mb-2`}>{p.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-4">{p.desc}</p>
                <div className={`text-[11px] font-medium ${p.color} opacity-60`}>{p.loss}</div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

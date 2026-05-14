import RevealOnScroll from "./RevealOnScroll"

const problems = [
  {
    icon: "📦",
    title: '"Livraison ترجع فجأة"',
    desc: "Tetsawer commande confirmée… ba3d 4 ayam ترجع.",
    loss: "15-25 TND par RTS",
    color: "text-red-400",
    border: "border-red-500/10",
    bg: "bg-red-500/5",
  },
  {
    icon: "📵",
    title: '"El client ma yjewbch"',
    desc: "3 appels. 2 messages. 0 réponse.",
    loss: "30-50 TND par commande",
    color: "text-amber-400",
    border: "border-amber-500/10",
    bg: "bg-amber-500/5",
  },
  {
    icon: "💸",
    title: '"Ads تصرف… والنتيجة ضعيفة"',
    desc: "Tjib commandes… أما marge تضيع fel RTS.",
    loss: "200-500 TND / mois",
    color: "text-purple-400",
    border: "border-purple-500/10",
    bg: "bg-purple-500/5",
  },
  {
    icon: "😵",
    title: '"L\'équipe ضايعة"',
    desc: "Chkoun confirmed ? Chkoun risqué ? Chkoun لازم retry ? Chaos.",
    loss: "Stress kol youm",
    color: "text-pink-400",
    border: "border-pink-500/10",
    bg: "bg-pink-500/5",
  },
]

export default function RealitySection() {
  return (
    <section className="relative px-5 py-20 sm:py-28">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <div className="max-w-xl mb-12">
            <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-4">T3ebna men</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              نفس المشاكل.
            </h2>
            <p className="mt-4 text-sm text-white/40 leading-relaxed">
              كل يوم نفس القصة. طلبات مزيفة. عملاء ما يردوش. فلوس تضيع. UGZIO يفهم اللي تعاني منه.
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

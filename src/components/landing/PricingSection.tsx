import RevealOnScroll from "./RevealOnScroll"

const plans = [
  {
    name: "ZioStart",
    price: "0",
    currency: "TND",
    period: "/mois",
    desc: "Jareb UGZIO b 3 commandes, sans carte",
    cta: "Nheb njareb",
    href: "/overview?demo=true",
    features: [
      { text: "3 commandes / mois", included: true },
      { text: "Analyse risque automatique", included: true },
      { text: "Séquences WhatsApp de base", included: true },
      { text: "Revenue tracking", included: true },
      { text: "Support email", included: true },
      { text: "Commandes illimitées", included: false },
      { text: "Séquences psychologiques avancées", included: false },
      { text: "Collection UGC automatique", included: false },
      { text: "Support WhatsApp prioritaire", included: false },
    ],
    highlight: false,
  },
  {
    name: "ZioGrow",
    price: "29",
    currency: "TND",
    period: "/mois",
    desc: "Lazemlek volume, hakka taw yebda",
    cta: "Nheb blassi",
    href: "/overview?demo=true",
    features: [
      { text: "Jusqu'à 500 commandes / mois", included: true },
      { text: "Analyse risque en 3 secondes", included: true },
      { text: "Séquences WhatsApp avancées", included: true },
      { text: "Protection revenue tracking", included: true },
      { text: "Séquences psychologiques avancées", included: true },
      { text: "Collection UGC automatique", included: true },
      { text: "Support WhatsApp prioritaire", included: false },
      { text: "Accès équipe (jusqu'à 3 membres)", included: false },
      { text: "Export données & rapports", included: false },
    ],
    highlight: false,
  },
  {
    name: "ZioPro",
    price: "79",
    currency: "TND",
    period: "/mois",
    desc: "Koul chay illimité, taw njihou barcha",
    cta: "Nheb nbadà tawa",
    href: "/overview?demo=true",
    features: [
      { text: "Commandes illimitées", included: true },
      { text: "Analyse risque en 3 secondes", included: true },
      { text: "Séquences WhatsApp avancées", included: true },
      { text: "Protection revenue tracking", included: true },
      { text: "Séquences psychologiques avancées", included: true },
      { text: "Collection UGC automatique", included: true },
      { text: "Support WhatsApp prioritaire", included: true },
      { text: "Accès équipe (jusqu'à 3 membres)", included: true },
      { text: "Export données & rapports", included: true },
    ],
    highlight: true,
    badge: "Barcha yhebbo",
  },
  {
    name: "ZioMax",
    price: "399",
    currency: "TND",
    period: "/mois",
    desc: "Multi-marques, équipe illimitée, tout inclus",
    cta: "Nheb nbadà tawa",
    href: "/overview?demo=true",
    features: [
      { text: "Commandes illimitées", included: true },
      { text: "Multi-marques (marques illimitées)", included: true },
      { text: "Analyse risque en 3 secondes", included: true },
      { text: "Séquences WhatsApp avancées", included: true },
      { text: "Collection UGC automatique", included: true },
      { text: "Support WhatsApp prioritaire", included: true },
      { text: "Accès équipe illimité", included: true },
      { text: "Export données & rapports", included: true },
      { text: "Account manager dédié", included: true },
    ],
    highlight: false,
  },
]

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-green-400" viewBox="0 0 16 16" fill="none">
      <path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-white/20" viewBox="0 0 16 16" fill="none">
      <path d="M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function PricingSection() {
  return (
    <section className="relative section-padding">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="section-container">
        <RevealOnScroll>
          <div className="section-intro section-intro-center">
            <p className="section-intro-label">Pricing</p>
            <h2 className="section-intro-title">
              Ch7al ykallef?{" "}
              <span className="landing-text-gradient">9ad ma t7eb</span>
            </h2>
            <p className="section-intro-desc">
              Ebed b Free, khater Croissance ki tkabar. Sahl.
              <span className="block text-white/30 text-xs mt-1">Mouch contrat. Mouch surprise. Mouch frais kbouria.</span>
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 md:grid-cols-3 lg:max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => (
            <RevealOnScroll key={plan.name} delay={i * 150}>
              <div
                className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:scale-[1.02] ${
                  plan.highlight
                    ? "border-[#FFD60A]/30 bg-[#FFD60A]/[0.04] shadow-lg shadow-[#FFD60A]/5"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFD60A] px-4 py-1 text-[10px] font-semibold text-[#0A0A0F] shadow-lg">
                      ⭐ {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-white/40 mt-1">{plan.desc}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-white/40">{plan.currency}</span>
                    <span className="text-xs text-white/30 ml-1">{plan.period}</span>
                  </div>
                </div>

                <a
                  href={plan.href}
                  className={`group relative w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.98] overflow-hidden inline-flex items-center justify-center mb-6 ${
                    plan.highlight ? "landing-glow-green text-[#0A0A0F]" : "border border-white/15 text-white"
                  }`}
                  style={{
                    backgroundColor: plan.highlight ? "#FFD60A" : "transparent",
                  }}
                >
                  <span className="relative z-10">{plan.cta}</span>
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                </a>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2.5">
                      {f.included ? <CheckIcon /> : <MinusIcon />}
                      <span className={`text-xs ${f.included ? "text-white/60" : "text-white/20"}`}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={300}>
          <div className="mt-10 text-center">
            <div className="landing-glass rounded-2xl p-6 sm:p-8 inline-block mx-auto max-w-[32rem]">
              <p className="text-sm text-white/70 font-medium mb-2">
                🎯 Koul plan yjib
              </p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/40">
                <span>✓ Analyse risque en 3 secondes</span>
                <span>✓ Séquences WhatsApp</span>
                <span>✓ Revenue tracking</span>
                <span>✓ Dashboard mobile</span>
                <span>✓ Mise à jour gratuites</span>
              </div>
              <p className="text-[10px] text-white/20 mt-4">
                Mouch carte bancaire lel plan Free. Tbadelt rayk? Tna7 f ay wa9t.
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}

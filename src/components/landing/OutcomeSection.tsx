import RevealOnScroll from "./RevealOnScroll"

export default function OutcomeSection() {
  return (
    <section className="relative section-padding">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="section-container">
        <RevealOnScroll>
          <div className="section-intro">
            <p className="section-intro-label">Résultat</p>
            <h2 className="section-intro-title">Moins d&apos;annulations. Moins de RTS. Plus de revenue.</h2>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 lg:grid-cols-2">
          <RevealOnScroll delay={0}>
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 sm:p-8">
              <p className="text-[11px] font-semibold tracking-widest text-red-400/60 uppercase mb-4">Avant UGZIO</p>
              <ul className="space-y-4">
                {[
                  { icon: "😰", text: "Stress quotidien — qui me fait perdre de l'argent ?" },
                  { icon: "📉", text: "30% de RTS — la marge fond" },
                  { icon: "💰", text: "500 TND+ perdus dans les fausses commandes" },
                  { icon: "🤯", text: "L'equipe perdue — qui a confirme, qui n'a pas repondu ?" },
                  { icon: "📱", text: "WhatsApp dans le chaos — tout est manuel" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 transition-all duration-300 hover:translate-x-1">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-red-300/80">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={150}>
            <div className="rounded-2xl border border-green-500/10 bg-green-500/5 p-6 sm:p-8">
              <p className="text-[11px] font-semibold tracking-widest text-green-400/60 uppercase mb-4">Apres UGZIO</p>
              <ul className="space-y-4">
                {[
                  { icon: "😌", text: "Clarte totale — vous savez exactement quoi faire" },
                  { icon: "📈", text: "8% de RTS — revenue protege" },
                  { icon: "🛡️", text: "500 TND+ proteges chaque mois" },
                  { icon: "⚡", text: "Votre equipe va plus vite — 3 secondes par decision" },
                  { icon: "✅", text: "WhatsApp organise — sequences automatisees" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 transition-all duration-300 hover:translate-x-1">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-green-300/80">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>
        </div>

        <RevealOnScroll delay={200}>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: "-22%", label: "RTS Rate", color: "text-green-400" },
              { value: "+40%", label: "Taux de confirmation", color: "text-purple-400" },
              { value: "3s", label: "Décision par commande", color: "text-blue-400" },
              { value: "500+", label: "TND protégés / mois", color: "text-emerald-400" },
            ].map((m) => (
              <div key={m.label} className="landing-glass rounded-xl p-4 text-center transition-all duration-300 hover:scale-[1.05]">
                <p className={`text-xl sm:text-2xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}

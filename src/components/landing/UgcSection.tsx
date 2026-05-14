import RevealOnScroll from "./RevealOnScroll"

const stories = [
  {
    handle: "@boutique_sfax",
    niche: "Mode femme • Sfax",
    quote: "Avant UGZIO, je perdais 400 dinars chaque mois dans des fausses commandes. Maintenant le systeme sait qui me fait perdre de l'argent avant que j'envoie.",
    saved: "+400 TND / mois",
    platform: "Instagram + WhatsApp",
  },
  {
    handle: "@parfum_tunis",
    niche: "Parfumerie • Tunis",
    quote: "Celui qui commande 200 dinars et ne repond pas — UGZIO lui envoie un message de confirmation. 80% des clients qui se perdaient confirment maintenant.",
    saved: "+280 TND / mois",
    platform: "Facebook + WhatsApp",
  },
  {
    handle: "@cosmetique_sousse",
    niche: "Cosmétique • Sousse",
    quote: "La difference entre 3 secondes avec UGZIO et 15 minutes manuel — l'argent que j'ai economise ce mois-ci couvre mon loyer.",
    saved: "+520 TND / mois",
    platform: "TikTok + WhatsApp",
  },
  {
    handle: "@electronix_tn",
    niche: "Électronique • Ariana",
    quote: "J'avais 30% de RTS. Apres UGZIO, c'est descendu a 8%. Le systeme protege vraiment la marge.",
    saved: "+340 TND / mois",
    platform: "Instagram + WhatsApp",
  },
]

export default function UgcSection() {
  return (
    <section className="relative section-padding">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="section-container">
        <RevealOnScroll>
          <div className="section-intro">
            <p className="section-intro-label">Témoignages</p>
            <h2 className="section-intro-title">La confiance genere des ventes.</h2>
            <p className="section-intro-desc">
              Quand le client est satisfait, il commande a nouveau, partage son experience et ramene d&apos;autres personnes. UGZIO construit ce cercle vertueux.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-4 sm:grid-cols-2">
          {stories.map((s, i) => (
            <RevealOnScroll key={s.handle} delay={i * 100}>
              <div
                className="landing-glass rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.01] cursor-default"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white relative"
                    style={{ backgroundColor: "#7c3aed" }}
                  >
                    {s.handle[1].toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0a0a0a] animate-status-online" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{s.handle}</p>
                      <span className="h-1 w-1 rounded-full bg-green-400 shrink-0" />
                      <span className="text-[10px] text-green-400/60 shrink-0">Vérifié</span>
                    </div>
                    <p className="text-xs text-white/40 truncate">{s.niche}</p>
                  </div>
                </div>

                <p className="text-sm text-white/60 leading-relaxed mb-4" style={{ fontFamily: "system-ui" }}>
                  &ldquo;{s.quote}&rdquo;
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-green-400 font-medium">
                    🛡️ {s.saved}
                  </span>
                  <span className="text-white/20">{s.platform}</span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

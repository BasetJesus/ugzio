import RevealOnScroll from "./RevealOnScroll"
import TrackedCTA from "./TrackedCTA"
import FloatingPhone from "./FloatingPhone"
import AnimatedWhatsAppMessage from "./AnimatedWhatsAppMessage"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-40 pb-16 sm:pb-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-purple-600/10 animate-glow-breathe pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <RevealOnScroll delay={0}>
            <div className="max-w-[36rem] text-left mx-auto sm:mx-none">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 mb-6 landing-glass">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[11px] text-white/50 tracking-wide">
                  🇹🇳 Pour les vendeurs COD tunisiens
                </span>
              </div>

              <h1 className="text-[clamp(1.75rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-white text-balance text-break-safe">
                <span className="block">Les annulations tuent</span>
                <span className="block gradient-brand-text">votre ecommerce.</span>
              </h1>

              <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/50 content-narrow">
                30% d&apos;annulations. Fausses commandes. Silence acheteur. Budget qui part en RTS. Stress quotidien.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/40 content-narrow">
                UGZIO analyse, confirme et sécurise chaque commande avant l&apos;envoi — et reduit les annulations.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <TrackedCTA
                  href="/overview?demo=true"
                  label="try_live_demo"
                  eventName="hero_cta_click"
                  className="inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.97] touch-manipulation landing-glow-purple relative overflow-hidden group w-full sm:w-auto"
                  style={{ backgroundColor: "#7c3aed" }}
                >
                  <span className="relative z-10">🚀 Démo Live</span>
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                </TrackedCTA>
                <TrackedCTA
                  href="/waitlist"
                  label="join_waitlist"
                  eventName="hero_cta_click"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-7 py-3.5 text-sm font-medium text-white/60 hover:text-white hover:border-white/30 transition-all touch-manipulation landing-glass w-full sm:w-auto"
                >
                  📲 Rejoindre l'attente
                </TrackedCTA>
              </div>

              <div className="mt-6 flex items-center sm:justify-start justify-center gap-3 text-xs text-white/30">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-status-online" />
                  Des vendeurs tunisiens testent déjà
                </span>
                <span className="hidden sm:inline text-white/10">•</span>
                <span className="hidden sm:inline">WhatsApp-native • COD-native</span>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <div className="relative lg:mt-0 flex flex-col items-center gap-6">
              <FloatingPhone badge="En direct">
                <div className="flex flex-col gap-2 pt-4 pb-6">
                  <div className="flex items-center gap-2 px-3 mb-3">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse-ring" />
                    <span className="text-[10px] text-green-400/60 font-medium tracking-wide">UGZIO • Live</span>
                  </div>

                  <AnimatedWhatsAppMessage
                    text="Nouvelle commande #4821 — 85 TND — Premier achat"
                    time="10:32"
                    align="left"
                    color="bg-zinc-800"
                    icon="📦"
                    delay={0}
                  />

                  <AnimatedWhatsAppMessage
                    text="Analyse du risque... Trust score: 23/100 ⚠️"
                    time="10:32"
                    align="right"
                    delay={1.2}
                    typing
                  />

                  <AnimatedWhatsAppMessage
                    text="Salem Ahmed! Votre commande a bien été reçue ✓ On vous confirme tout ça dans 5 min"
                    time="10:33"
                    align="right"
                    delay={2.4}
                  />

                  <AnimatedWhatsAppMessage
                    text="C'est bon, je confirme! Merci 😊"
                    time="10:38"
                    align="left"
                    color="bg-zinc-800"
                    delay={3.6}
                  />

                  <AnimatedWhatsAppMessage
                    text="✅ Commande confirmée • 85 TND sécurisés"
                    time="10:38"
                    align="right"
                    delay={4.8}
                  />

                  <div className="mt-2 mx-3 rounded-lg bg-gradient-to-r from-purple-600/20 to-green-500/20 border border-purple-500/10 px-3 py-2">
                    <p className="text-[10px] font-semibold text-green-400">+85 TND protégés</p>
                    <p className="text-[8px] text-white/30">RTS évité • Marge préservée</p>
                  </div>
                </div>
              </FloatingPhone>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  )
}

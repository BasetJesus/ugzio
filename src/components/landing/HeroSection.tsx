import WhatsAppFlowFeed from "./WhatsAppFlowFeed"
import RevealOnScroll from "./RevealOnScroll"

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
                <span className="block">El commandes elli kenet</span>
                <span className="block landing-text-gradient">ترجع…</span>
                <span className="block mt-1">UGZIO ywalli y7awelhom l</span>
                <span className="block text-transparent bg-clip-text" style={{
                  backgroundImage: "linear-gradient(135deg, #4ade80, #34d399)"
                }}>revenue.</span>
              </h1>

              <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/50 content-narrow">
                Fake clients. Clients ma yjewbouch. Livraison ترجع. Ads tethra9. Stress kol youm.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/40 content-narrow">
                UGZIO y5allik تشوف les commandes risquées, تبعث message s7i7, وتأكد el clients قبل ma tetkasser marge mte3ek.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <a
                  href="/overview?demo=true"
                  className="inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.97] touch-manipulation landing-glow-purple relative overflow-hidden group w-full sm:w-auto"
                  style={{ backgroundColor: "#7c3aed" }}
                >
                  <span className="relative z-10">🚀 Try Live Demo</span>
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                </a>
                <a
                  href="/waitlist"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-7 py-3.5 text-sm font-medium text-white/60 hover:text-white hover:border-white/30 transition-all touch-manipulation landing-glass w-full sm:w-auto"
                >
                  📲 Join Waitlist
                </a>
              </div>

              <div className="mt-6 flex items-center sm:justify-start justify-center gap-3 text-xs text-white/30">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-status-online" />
                  Des vendeurs tunisiens testent déjà
                </span>
                <span className="hidden sm:inline text-white/10">•</span>
                <span className="hidden sm:inline">WhatsApp-native • COD-focused</span>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <div className="relative lg:mt-0">
              <div className="flex flex-col gap-4">
                <WhatsAppFlowFeed />

                <div className="grid grid-cols-3 gap-3">
                  <div className="landing-glass rounded-xl p-3 sm:p-4 text-center animate-hero-float-1 hover:scale-[1.03] transition-transform duration-300">
                    <p className="text-lg sm:text-xl font-bold text-purple-400">94</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Risk Score</p>
                  </div>
                  <div className="landing-glass rounded-xl p-3 sm:p-4 text-center animate-hero-float-2 hover:scale-[1.03] transition-transform duration-300" style={{ animationDelay: "1s" }}>
                    <p className="text-lg sm:text-xl font-bold text-green-400">85</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">TND Saved</p>
                  </div>
                  <div className="landing-glass rounded-xl p-3 sm:p-4 text-center animate-hero-float-3 hover:scale-[1.03] transition-transform duration-300" style={{ animationDelay: "2s" }}>
                    <p className="text-lg sm:text-xl font-bold text-amber-400">23</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Trust Score</p>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  )
}

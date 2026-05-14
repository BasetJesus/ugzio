import RevealOnScroll from "./RevealOnScroll"

export default function FinalCtaSection() {
  return (
    <section className="relative section-padding">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="section-container">
      <div className="mx-auto max-w-[42rem] text-center relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-600/10 animate-glow-breathe pointer-events-none" />

        <RevealOnScroll>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight relative z-10">
            التجارة في تونس تبدلت.
          </h2>
          <p className="text-lg sm:text-xl text-purple-300/80 mt-3 font-medium relative z-10">
            لازم operations mte3ek زادة تتبدل.
          </p>

          <p className="mt-6 text-sm text-white/40 leading-relaxed max-w-[32rem] mx-auto relative z-10">
            UGZIO معمول للناس اللي تبيع réellement fi Tounes. Mouch SaaS générique.
            COD. WhatsApp. UGC. Operations. Kollhom fi système واحد.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 relative z-10">
            <a
              href="/overview?demo=true"
              className="group inline-flex items-center justify-center rounded-xl px-8 py-4 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.97] touch-manipulation landing-glow-purple min-w-[200px] relative overflow-hidden"
              style={{ backgroundColor: "#7c3aed" }}
            >
              <span className="relative z-10">🚀 Try Live Demo</span>
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            </a>
            <a
              href="/waitlist"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-8 py-4 text-sm font-medium text-white/60 hover:text-white hover:border-white/30 transition-all touch-manipulation landing-glass min-w-[200px]"
            >
              🇹🇳 Join Waitlist
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-white/20 relative z-10">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-status-online" />
              WhatsApp-first
            </span>
            <span className="text-white/10">•</span>
            <span>COD-native</span>
            <span className="text-white/10">•</span>
            <span>Mobile-native</span>
          </div>
        </RevealOnScroll>
      </div>
      </div>
    </section>
  )
}

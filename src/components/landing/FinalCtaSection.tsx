export default function FinalCtaSection() {
  return (
    <section className="relative px-5 py-20 sm:py-28">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="mx-auto max-w-2xl text-center relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-600/10 animate-glow-breathe pointer-events-none" />

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight relative z-10">
          التجارة في تونس تبدلت.
        </h2>
        <p className="text-lg sm:text-xl text-purple-300/80 mt-3 font-medium relative z-10">
          لازم operations mte3ek زادة تتبدل.
        </p>

        <p className="mt-6 text-sm text-white/40 leading-relaxed max-w-lg mx-auto relative z-10">
          UGZIO معمول للناس اللي تبيع réellement fi Tounes. Mouch SaaS generic.
          COD. WhatsApp. UGC. Operations. Kollhom fi système واحد.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 relative z-10">
          <a
            href="/overview?demo=true"
            className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.97] touch-manipulation landing-glow-purple min-w-[200px]"
            style={{ backgroundColor: "#7c3aed" }}
          >
            🚀 Start Live Demo
          </a>
          <a
            href="/waitlist"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-8 py-4 text-sm font-medium text-white/60 hover:text-white hover:border-white/30 transition-all touch-manipulation landing-glass min-w-[200px]"
          >
            🇹🇳 Join Tunisian Sellers
          </a>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-white/20 relative z-10">
          <span>WhatsApp-first</span>
          <span className="text-white/10">•</span>
          <span>COD-native</span>
          <span className="text-white/10">•</span>
          <span>Mobile-native</span>
        </div>
      </div>
    </section>
  )
}

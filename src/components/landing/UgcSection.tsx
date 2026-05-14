const stories = [
  {
    handle: "@boutique_sfax",
    niche: "Mode femme • Sfax",
    quote: "قبل UGZIO كنت نخسر 400 دينار كل شهر في طلبات مزيفة. دابا النظام يعرف مين يخسرني قبل ما نبعث.",
    saved: "+400 TND / mois",
    platform: "Instagram + WhatsApp",
  },
  {
    handle: "@parfum_tunis",
    niche: "Parfumerie • Tunis",
    quote: "اللي يطلب 200 دينار وما يردش — UGZIO يبعثو message يتأكد. 80% من العملاء اللي كانو يضيعو صارو يconfirmi.",
    saved: "+280 TND / mois",
    platform: "Facebook + WhatsApp",
  },
  {
    handle: "@cosmetique_sousse",
    niche: "Cosmétique • Sousse",
    quote: "الفرق بين 3 ثواني UGZIO و15 دقيقة manual — الفلوس اللي حافظتها هذا الشهر تغطي الإيجار.",
    saved: "+520 TND / mois",
    platform: "TikTok + WhatsApp",
  },
  {
    handle: "@electronix_tn",
    niche: "Électronique • Ariana",
    quote: "كان عندي 30% RTS rate. بعد UGZIO نزلت لـ 8% فقط. النظام يحمي المارج حقاً.",
    saved: "+340 TND / mois",
    platform: "Instagram + WhatsApp",
  },
]

export default function UgcSection() {
  return (
    <section className="relative px-5 py-20 sm:py-28">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl mb-12">
          <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-4">
            Social Proof
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            El confiance تجيب ventes.
          </h2>
          <p className="mt-4 text-sm text-white/40 leading-relaxed">
            Ki el client yethenna — y3awed يشري, yposti story, yab3eth feedback. UGZIO يبني trust cycle.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {stories.map((s) => (
            <div
              key={s.handle}
              className="landing-glass rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: "#7c3aed" }}
                >
                  {s.handle[1].toUpperCase()}
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
          ))}
        </div>
      </div>
    </section>
  )
}

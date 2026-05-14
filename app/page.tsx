export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: "#0a0a0a" }}>
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="text-sm font-bold tracking-tight" style={{ color: "#7c3aed" }}>UGZIO</span>
          <div className="flex items-center gap-3 text-xs">
            <a href="/login" className="text-white/50 hover:text-white transition-colors">Connexion</a>
            <a
              href="/overview?demo=true"
              className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "#7c3aed" }}
            >
              Démo live
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1" style={{ backgroundColor: "#0a0a0a" }}>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-5 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#7c3aed" }} />
                <span className="text-xs text-white/40 tracking-wide">Protection revenue COD</span>
              </div>

              <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl text-white">
                Chaque commande refusée, c&apos;est votre argent qui part.
              </h1>

              <p className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg" style={{ fontFamily: "system-ui" }}>
                كل طلب ترجعلك — خسارة حقيقية. UGZIO يحميك قبل ما تصير.
              </p>

              <p className="mt-3 text-sm text-white/40">
                Intelligence comportementale pour les vendeurs COD tunisiens. UGZIO analyse le risque de chaque acheteur en 3 secondes.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/overview?demo=true"
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#7c3aed" }}
                >
                  Voir la démo live
                </a>
                <a
                  href="/waitlist"
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3.5 text-sm font-medium text-white/60 hover:text-white hover:border-white/40 transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                >
                  Rejoindre la liste d&apos;attente
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="border-y border-white/5">
          <div className="mx-auto max-w-5xl px-5 py-10">
            <div className="grid grid-cols-3 gap-2 sm:gap-10 text-center">
              <div>
                <p className="text-lg sm:text-3xl font-bold" style={{ color: "#7c3aed" }}>23%</p>
                <p className="text-sm text-white/50 mt-1">طلبات مرفوضة تمنعها UGZIO</p>
              </div>
              <div>
                <p className="text-lg sm:text-3xl font-bold" style={{ color: "#7c3aed" }}>4,850 TND</p>
                <p className="text-sm text-white/50 mt-1">محمية كل شهر</p>
              </div>
              <div>
                <p className="text-lg sm:text-3xl font-bold" style={{ color: "#7c3aed" }}>3s</p>
                <p className="text-sm text-white/50 mt-1">وقت القرار</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem ── */}
        <section className="px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl max-w-xl">
              Vous reconnaissez ces situations ?
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 p-6 transition-colors hover:border-white/20" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📵</span>
                </div>
                <h3 className="text-sm font-semibold text-white">L&apos;acheteur ne répond plus</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">
                  رقمو غالط أو ما يردش — تبعث الطرد وترجعلك
                </p>
                <p className="mt-3 text-xs text-white/30">Pertes: 15-25 TND par RTS</p>
              </div>

              <div className="rounded-xl border border-white/10 p-6 transition-colors hover:border-white/20" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📦</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Les fausses commandes COD</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">
                  يطلب بـ 300 TND — ما يجيش يقبض — خسرت الشحن والمنتج
                </p>
                <p className="mt-3 text-xs text-white/30">Pertes: 30-50 TND par commande</p>
              </div>

              <div className="rounded-xl border border-white/10 p-6 transition-colors hover:border-white/20" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎲</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Vous ne savez pas qui est risqué</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">
                  كل طلب قمار — ما عندكش نظام يقولك مين يخسرك
                </p>
                <p className="mt-3 text-xs text-white/30">Pertes: 200-500 TND / mois</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Solution ── */}
        <section className="border-y border-white/5 px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl mb-14">
              <h2 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                UGZIO analyse chaque acheteur en 3 secondes.
              </h2>
              <p className="mt-3 text-sm text-white/50">
                مش ذكاء اصطناعي عام — نظام مبني خصيصاً للبائع التونسي
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold" style={{ backgroundColor: "rgba(124,58,237,0.15)", color: "#7c3aed" }}>01</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Score de risque 0-100</h3>
                <p className="mt-1 text-sm text-white/50">تعرف مين يخسرك قبل ما تبعث</p>
                <p className="mt-2 text-xs text-white/30">Trust score basé sur le comportement d&apos;achat et l&apos;historique du numéro.</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold" style={{ backgroundColor: "rgba(124,58,237,0.15)", color: "#7c3aed" }}>02</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Séquences WhatsApp</h3>
                <p className="mt-1 text-sm text-white/50">رسائل تأكيد نفسية — مش رسائل عادية</p>
                <p className="mt-2 text-xs text-white/30">Chaque acheteur reçoit une approche psychologique adaptée à son profil.</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold" style={{ backgroundColor: "rgba(124,58,237,0.15)", color: "#7c3aed" }}>03</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Protection revenue</h3>
                <p className="mt-1 text-sm text-white/50">UGZIO يحسب كل دينار حميتو</p>
                <p className="mt-2 text-xs text-white/30">Chaque décision est mesurée. UGZIO calcule exactement ce que vous avez sauvé.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social Proof ── */}
        <section className="px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl max-w-xl">
              Des vendeurs tunisiens protègent leur revenue.
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { handle: "@boutique_sfax", niche: "Mode femme", quote: "قبل UGZIO كنت نخسر 400 دينار كل شهر في طلبات مزيفة. دابا ما صار هذا الشيء" },
                { handle: "@parfum_tunis", niche: "Parfumerie", quote: "النظام يعرف مين يخسرك. ما عدتش نبعث للكل بعيون مغمضة" },
                { handle: "@cosmetique_sousse", niche: "Cosmétique", quote: "3 ثواني وتعرف إذا الطلب حقيقي — هذا اللي كنت محتاجو" },
              ].map((testimonial, i) => (
                <div key={i} className="rounded-xl border border-white/10 p-6 transition-colors hover:border-white/20" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#7c3aed" }}>
                      {testimonial.handle[1].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{testimonial.handle}</p>
                      <p className="text-xs text-white/40">{testimonial.niche}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed" style={{ fontFamily: "system-ui" }}>
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Waitlist CTA ── */}
        <section className="border-y border-white/5 px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
              UGZIO n&apos;est pas encore public.
            </h2>
            <p className="mt-3 text-sm text-white/50">
              قائمة الانتظار مفتوحة — المقاعد محدودة
            </p>

            <div className="mt-8">
              <a
                href="/waitlist"
                className="inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "#7c3aed" }}
              >
                Rejoindre maintenant
              </a>
            </div>

            <p className="mt-4 text-xs text-white/30">
              Accès prioritaire pour les 100 premiers vendeurs
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="mx-auto max-w-5xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            UGZIO &mdash; Protection revenue pour les vendeurs COD tunisiens
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="/overview?demo=true" className="hover:text-white/60 transition-colors">Démo live</a>
            <a href="/waitlist" className="hover:text-white/60 transition-colors">Liste d&apos;attente</a>
            <a href="mailto:contact@ugzio.com" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

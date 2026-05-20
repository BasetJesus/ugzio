import RevealOnScroll from "./RevealOnScroll"

const examples = [
  {
    product: "عباية سوداء فخمة",
    tone: "هادئ",
    caption: "روتيني اليومي… ما يكملش غير بهذه العباية 😌\nصراحة، جربت برشا عباءات… و هذي الوحيدة اللي حبيتها\nتوفرت ب 89 دينار فقط",
    tags: ["#عباية", "#موضة_تونس", "#عباية_فخمة"],
  },
  {
    product: "زيت زيتون بكر ممتاز",
    tone: "مضحك",
    caption: "حتى راجلك يحبك أكثر إذا جبتي زيت زيتون أصلي 😂\nيقولك شنو هالغلابة هذي؟ قلتلو زيت زيتون بكر ممتاز باش نطبخو\nالطعم كيف ما تحبي",
    tags: ["#زيت_زيتون", "#تونس", "#طبخ_تونسي"],
  },
  {
    product: "كريم ترطيب طبيعي",
    tone: "ملهم",
    caption: "كل نجمة تبدأ بخطوة ✨\nو أنت تستاهل أفضل نسخة من روحك… ابدأ النهار بالعناية الي ترضيك\nبشرة نضرة = ثقة عالية",
    tags: ["#عناية_بالذات", "#كريم_ترطيب", "#جمال_تونس"],
  },
]

export default function CaptionDemoSection() {
  return (
    <section className="relative section-padding">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="section-container">
        <RevealOnScroll>
          <div className="section-intro">
            <p className="section-intro-label">Caption Engine</p>
            <h2 className="section-intro-title">Captions en darija generes par IA.</h2>
            <p className="section-intro-desc">
              ZioBrain ecrit des captions pour Instagram, TikTok et Facebook en Tunisien — adaptes a ton produit, a ton audience et a ton ton de marque. Plus besoin de passer 30 minutes a trouver les bons mots.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-4 sm:grid-cols-3">
          {examples.map((ex, i) => (
            <RevealOnScroll key={ex.product} delay={i * 100}>
              <div className="landing-glass rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] cursor-default">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{ex.tone}</span>
                  <span className="text-[10px] text-[#FFD60A]/60">{ex.product}</span>
                </div>

                <p className="text-sm text-white/70 leading-relaxed mb-4 whitespace-pre-line">
                  &ldquo;{ex.caption}&rdquo;
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {ex.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={400}>
          <div className="mt-8 text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFD60A] px-5 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-[#FFD60A]/90 hover:scale-[1.02]"
            >
              ✍ جرب توليد الكابتشينات
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}

export default function OutcomeSection() {
  return (
    <section className="relative px-5 py-20 sm:py-28">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl mb-14">
          <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-4">Résultat</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            A9al stress. A9al RTS. A9wa operations.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 sm:p-8">
            <p className="text-[11px] font-semibold tracking-widest text-red-400/60 uppercase mb-4">Qbel UGZIO</p>
            <ul className="space-y-4">
              {[
                { icon: "😰", text: "Stress kol youm — chkoun yakhserni?" },
                { icon: "📉", text: "30% RTS rate — marge tethrek" },
                { icon: "💰", text: "500 TND+ yodh3ou fel fausses commandes" },
                { icon: "🤯", text: "L'équipe ضايعة — chkoun confirmé, chkoun lé?" },
                { icon: "📱", text: "WhatsApp fi chaos — messages manuels kol chay" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-red-300/80">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-green-500/10 bg-green-500/5 p-6 sm:p-8">
            <p className="text-[11px] font-semibold tracking-widest text-green-400/60 uppercase mb-4">Ba3d UGZIO</p>
            <ul className="space-y-4">
              {[
                { icon: "😌", text: "Clarté totale — تعرف شنوّة لازم تعمل" },
                { icon: "📈", text: "8% RTS rate — revenue محفوظ" },
                { icon: "🛡️", text: "500 TND+ محمية كل شهر" },
                { icon: "⚡", text: "فريقك يخدم أسرع — 3 secondes par décision" },
                { icon: "✅", text: "WhatsApp ywalli organized — automated sequences" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-green-300/80">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: "-22%", label: "RTS Rate", color: "text-green-400" },
            { value: "+40%", label: "Taux de confirmation", color: "text-purple-400" },
            { value: "3s", label: "Temps de décision", color: "text-blue-400" },
            { value: "500+", label: "TND protégés / mois", color: "text-emerald-400" },
          ].map((m) => (
            <div key={m.label} className="landing-glass rounded-xl p-4 text-center">
              <p className={`text-xl sm:text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

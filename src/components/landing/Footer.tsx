export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-8">
      <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/20 text-center sm:text-left">
          Conçu en Tunisie pour le commerce tunisien. WhatsApp-first. COD-native. Mobile-native.
        </p>
        <div className="flex items-center gap-4 text-xs text-white/20">
          <a href="/overview?demo=true" className="hover:text-white/40 transition-colors">Démo Live</a>
          <a href="/waitlist" className="hover:text-white/40 transition-colors">Liste d'attente</a>
          <a href="mailto:contact@ugzio.com" className="hover:text-white/40 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}

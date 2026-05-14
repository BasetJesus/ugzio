export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-8">
      <div className="mx-auto max-w-6xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/20">
          Built in Tunisia for Tunisian commerce. WhatsApp-first. COD-native. Mobile-native.
        </p>
        <div className="flex items-center gap-4 text-xs text-white/20">
          <a href="/overview?demo=true" className="hover:text-white/40 transition-colors">Live Demo</a>
          <a href="/waitlist" className="hover:text-white/40 transition-colors">Waitlist</a>
          <a href="mailto:contact@ugzio.com" className="hover:text-white/40 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}

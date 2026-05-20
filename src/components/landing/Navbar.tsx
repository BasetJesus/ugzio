export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04]" style={{ backgroundColor: "rgba(10,10,10,0.85)" }}>
      <div className="section-container flex items-center justify-between py-4">
        <span className="text-base font-bold tracking-tight landing-text-gradient">UGZIO</span>
        <div className="flex items-center gap-3">
          <a
            href="/waitlist"
            className="text-xs text-white/50 hover:text-white/70 transition-colors px-3 py-2 rounded-lg touch-manipulation"
          >
            Connexion
          </a>
          <a
            href="/overview?demo=true"
            className="rounded-lg px-5 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.97] touch-manipulation"
            style={{ backgroundColor: "#FFD60A", color: "#0A0A0F" }}
          >
            Démo Live
          </a>
        </div>
      </div>
    </nav>
  )
}

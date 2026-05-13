export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-sm font-bold tracking-tight text-zinc-100">UGZIO</span>
          <a
            href="/onboarding"
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500 transition-colors"
          >
            Start protecting orders
          </a>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-800/50 py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-xs text-zinc-600">UGZIO &mdash; commerce operations intelligence</p>
        </div>
      </footer>
    </div>
  );
}

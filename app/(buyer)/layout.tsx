export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--bg-base)]">
      <main className="mx-auto max-w-lg px-4 py-6 pb-safe">
        {children}
      </main>
    </div>
  )
}

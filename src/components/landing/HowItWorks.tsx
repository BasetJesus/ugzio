export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-zinc-800/50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">How it works</h2>
          <p className="mt-2 text-sm text-zinc-500">Three steps to protect your revenue</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-400">
              1
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-200">Orders enter automatically</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Connect your sales channel or create orders manually. UGZIO reads every new order instantly.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-sm font-bold text-red-400">
              2
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-200">Risk is flagged before shipping</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              UGZIO scores each order by buyer history, amount, and behavioral signals. High-risk orders surface immediately.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-sm font-bold text-purple-400">
              3
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-200">Operators act in one click</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Confirm, cancel, or flag suspicious orders directly from the operations panel. No complex workflows.
            </p>
          </div>
        </div>

        <p className="mt-12 text-center text-sm text-zinc-500 border-t border-zinc-800/50 pt-8">
          Reduce failed deliveries without changing your workflow
        </p>
      </div>
    </section>
  );
}

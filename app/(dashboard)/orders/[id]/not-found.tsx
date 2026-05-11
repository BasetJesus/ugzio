"use client"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center p-6 py-24 text-center">
      <span className="text-4xl">🔍</span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-300">Order not found</h2>
      <p className="mt-1 text-sm text-zinc-500">This order doesn&apos;t exist or has been deleted.</p>
      <a href="/orders" className="mt-4 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500">
        Back to Orders
      </a>
    </div>
  )
}

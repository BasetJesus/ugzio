"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const WILAYAS = ["Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Hammamet", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan", "Bizerte", "Gabès", "Gafsa", "Medenine", "Tataouine", "Tozeur", "Kebili", "Jendouba", "Béja", "Le Kef", "Siliana", "Kasserine", "Zaghouan"];

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const buyerName = form.get("buyerName") as string;
    const buyerPhone = form.get("buyerPhone") as string;
    const product = form.get("product") as string;
    const amount = form.get("amount") as string;
    const buyerWilaya = form.get("buyerWilaya") as string;

    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName,
          buyerPhone,
          product,
          amount: parseFloat(amount),
          buyerWilaya: buyerWilaya || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur");
        return;
      }

      const order = await res.json();
      router.push(`/orders?id=${order.id}`);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg p-4 sm:p-0">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm">📤</span>
        <div>
          <h1 className="text-xl font-bold text-white">Activate — New Order</h1>
          <p className="text-xs text-zinc-500">Create a new buyer order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Nom de l&apos;acheteur</label>
          <input name="buyerName" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-emerald-400" placeholder="Ahmed" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Téléphone (WhatsApp)</label>
          <input name="buyerPhone" type="tel" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-emerald-400" placeholder="+216 XX XXX XXX" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Produit</label>
          <input name="product" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-emerald-400" placeholder="3abia, parfum..." />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Montant (TND)</label>
          <input name="amount" type="number" step="0.5" min="0" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-emerald-400" placeholder="0.000" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Wilaya de livraison</label>
          <select name="buyerWilaya" className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-emerald-400">
            <option value="">Sélectionne une wilaya</option>
            {WILAYAS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer la commande"}
        </button>
      </form>
    </div>
  );
}

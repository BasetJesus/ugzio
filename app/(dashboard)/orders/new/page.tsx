"use client";

import { FormEvent, useState } from "react";

export default function NewOrderPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = new FormData(e.currentTarget);
    const buyerName = form.get("buyerName") as string;
    const buyerPhone = form.get("buyerPhone") as string;
    const product = form.get("product") as string;
    const amount = form.get("amount") as string;

    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName,
          buyerPhone,
          product,
          amount: parseFloat(amount),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur");
        return;
      }

      setSuccess(`Commande créée pour ${buyerName}`);
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Nouvelle commande</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>
        )}
        {success && (
          <div className="rounded-xl border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-400">{success}</div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Nom de l&apos;acheteur</label>
          <input name="buyerName" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-purple-500" placeholder="Ahmed" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Téléphone</label>
          <input name="buyerPhone" type="tel" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-purple-500" placeholder="+216 XX XXX XXX" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Produit</label>
          <input name="product" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-purple-500" placeholder="3abia, parfum..." />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Montant (TND)</label>
          <input name="amount" type="number" step="0.5" min="0" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-purple-500" placeholder="0.000" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer la commande"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const shopName = form.get("shopName") as string;
    const sellerPhone = form.get("sellerPhone") as string;
    const wilaya = form.get("wilaya") as string;
    const category = form.get("category") as string;

    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, sellerPhone, wilaya, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur");
        return;
      }

      router.push("/");
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="text-center mb-8">
        <p className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            UGZIO
          </span>
        </p>
        <p className="mt-2 text-zinc-400">Configure ton compte en 2 minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Nom de la boutique
          </label>
          <input
            name="shopName"
            required
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-purple-500"
            placeholder="Moncef Store"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Téléphone (WhatsApp)
          </label>
          <input
            name="sellerPhone"
            type="tel"
            required
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-purple-500"
            placeholder="+216 XX XXX XXX"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Wilaya de livraison
          </label>
          <select
            name="wilaya"
            required
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-purple-500"
          >
            <option value="">Sélectionne</option>
            {["Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Hammamet", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan", "Bizerte", "Gabès", "Gafsa", "Medenine", "Tataouine", "Tozeur", "Kebili", "Jendouba", "Béja", "Le Kef", "Siliana", "Kasserine", "Zaghouan"].map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Catégorie de produits
          </label>
          <select
            name="category"
            required
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 outline-none transition focus:border-purple-500"
          >
            <option value="">Sélectionne</option>
            <option value="vetements">Vêtements</option>
            <option value="cosmetiques">Cosmétiques</option>
            <option value="accessoires">Accessoires</option>
            <option value="parfums">Parfums</option>
            <option value="naturel">Produits naturels</option>
            <option value="alimentation">Alimentation</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
        >
          {loading ? "Configuration..." : "Commencer 🚀"}
        </button>
      </form>
    </div>
  );
}

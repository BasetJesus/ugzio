"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Registration failed");
        return;
      }

      router.push("/auth/login");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <p className="text-2xl font-bold tracking-tight">
          <span className="inline-flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-green-600 text-xs font-bold text-white">U</span>
            <span className="text-zinc-100">
              UGZIO
            </span>
          </span>
        </p>
        <p className="mt-1 text-sm text-zinc-500">Create your account</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-400">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-md border border-zinc-800/50 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-green-500"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-400">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-zinc-800/50 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-green-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-400">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-md border border-zinc-800/50 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-green-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-xs text-zinc-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-green-400 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

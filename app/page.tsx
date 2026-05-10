"use client";

import { useState } from "react";

interface Caption {
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
  full: string;
}

const TONES = [
  { id: "casual", label: "عادي", emoji: "😎" },
  { id: "funny", label: "مضحك", emoji: "😂" },
  { id: "inspirational", label: "ملهم", emoji: "✨" },
  { id: "romantic", label: "رومانسي", emoji: "❤️" },
  { id: "savage", label: "قوي", emoji: "🔥" },
  { id: "aesthetic", label: "فني", emoji: "🎨" },
];

const LANGUAGES = [
  { id: "darija", label: "الدارجة" },
  { id: "english", label: "English" },
  { id: "french", label: "Français" },
];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "facebook", label: "Facebook", emoji: "👍" },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("casual");
  const [lang, setLang] = useState("darija");
  const [platform, setPlatform] = useState("instagram");
  const [price, setPrice] = useState("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setCaptions([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          tone,
          lang,
          platform,
          price: price.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setCaptions(data.captions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-10 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            UGZIO
          </span>
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          <span className="text-purple-400">تونس</span>ي و نفتخر
        </p>
      </header>

      <div className="flex-1 space-y-5">
        <div>
          <label
            htmlFor="topic"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            شنو المنتوج؟
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="e.g. حرڨة, شاكية, زيت زيتون, مرقاز..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              السعر (TND)
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.5"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 29"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-zinc-300">المنصة</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  platform === p.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-zinc-300">النغمة</p>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  tone === t.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-zinc-300">اللغة</p>
          <div className="flex gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  lang === l.id
                    ? "bg-zinc-100 text-zinc-900"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                جاري التوليد...
              </>
            ) : (
              "توليد الكابتشينات"
            )}
          </button>

          {captions.length > 0 && (
            <button
              onClick={generate}
              disabled={loading || !topic.trim()}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3.5 font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              title="توليد من جديد"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              توليد من جديد
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {captions.length > 0 && (
          <div className="space-y-4 pt-2">
            <p className="text-sm font-medium text-zinc-400">
              النتيجة ({captions.length})
            </p>
            {captions.map((caption, i) => (
              <div
                key={i}
                className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700"
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="rounded-md bg-purple-600/20 px-2 py-0.5 text-xs font-medium text-purple-400">
                    {i + 1}
                  </span>
                  <button
                    onClick={() => copy(caption.full, i)}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-800 hover:text-purple-400"
                  >
                    {copiedIndex === i ? (
                      <>تم النسخ ✓</>
                    ) : (
                      <>
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                        نسخ الكل
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-base font-semibold leading-snug text-purple-200">
                    {caption.hook}
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-200">
                    {caption.body}
                  </p>
                  <p className="text-sm text-purple-300/70">
                    {caption.hashtags.join(" ")}
                  </p>
                  <p className="text-sm font-medium text-pink-300">
                    {caption.cta}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-xs text-zinc-600">
        UGZIO &mdash; توليد الكابتشينات بالدارجة التونسية
      </footer>
    </div>
  );
}

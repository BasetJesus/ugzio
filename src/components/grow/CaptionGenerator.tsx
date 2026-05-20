"use client";

import { useState, useEffect } from "react";

interface Caption {
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
  full: string;
}

interface BrandProfile {
  niche?: string;
  audience?: string;
  brandTone?: string;
  usp?: string;
}

const TONES = [
  { value: "calm", labelAr: "هادئ", labelFr: "Calme", emoji: "😌" },
  { value: "funny", labelAr: "مضحك", labelFr: "Drôle", emoji: "😂" },
  { value: "inspirational", labelAr: "ملهم", labelFr: "Inspirant", emoji: "✨" },
  { value: "strong", labelAr: "قوي", labelFr: "Fort", emoji: "🔥" },
];

const PLATFORMS = [
  { value: "instagram", labelAr: "انستغرام", labelFr: "Instagram", icon: "📸" },
  { value: "tiktok", labelAr: "تيك توك", labelFr: "TikTok", icon: "🎵" },
  { value: "facebook", labelAr: "فيسبوك", labelFr: "Facebook", icon: "👍" },
];

export default function CaptionGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("calm");
  const [platform, setPlatform] = useState("instagram");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setCaptions([]);
    try {
      const res = await fetch("/api/v1/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          tone,
          platform,
          price: price.trim(),
          link: link.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "فشل التوليد"); return; }
      setCaptions(data.captions ?? []);
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(full: string, index: number) {
    try {
      await navigator.clipboard.writeText(full);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)]">شنو تبيع؟ *</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="مثال: عباية سوداء فخمة, زيت زيتون بكر, معقّرن..."
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">النغمة</label>
          <div className="mt-1 flex gap-1.5 flex-wrap">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  tone === t.value
                    ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/30"
                }`}
              >
                {t.emoji} {t.labelAr}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">المنصة</label>
          <div className="mt-1 flex gap-1.5 flex-wrap">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  platform === p.value
                    ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/30"
                }`}
              >
                {p.icon} {p.labelAr}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">الثمن (اختياري)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="مثال: 89"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">رابط المنتوج (اختياري)</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--accent)]/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "جاري التوليد..." : "✨ ولّد الكابتشينات"}
      </button>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-400">{error}</div>
      )}

      {captions.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-[var(--text-secondary)]">النتائج</p>
          {captions.map((cap, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-2"
            >
              <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line font-arabic">
                {cap.full}
              </p>
              <button
                onClick={() => handleCopy(cap.full, i)}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                {copiedIndex === i ? "✅ تم النسخ" : "📋 نسخ"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

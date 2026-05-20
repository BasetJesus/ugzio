"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";

interface CaptionOutput {
  lang: string;
  type: string;
  text: string;
}

interface CaptionProfile {
  niche?: string | null;
  audience?: string | null;
  brandTone?: string | null;
  usp?: string | null;
}

interface Props {
  initialProfile: CaptionProfile | null;
}

const TONES = [
  { value: "calm", label: "Calm / Reassuring" },
  { value: "funny", label: "Funny / Tunisian Humor" },
  { value: "inspirational", label: "Inspirational / Motivational" },
  { value: "strong", label: "Bold / Confident" },
];

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
];

export default function CaptionFlowClient({ initialProfile }: Props) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("calm");
  const [platform, setPlatform] = useState("instagram");
  const [price, setPrice] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputs, setOutputs] = useState<CaptionOutput[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), tone, platform, price: price || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Generation failed");
      }

      const data = await res.json();
      const generated: CaptionOutput[] = [];

      if (data.hook) {
        generated.push({ lang: "Hook", type: "inter", text: data.hook });
      }
      if (data.body) {
        generated.push({ lang: "Body", type: platform === "tiktok" ? "inter" : "cairo", text: data.body });
      }
      if (data.cta) {
        generated.push({ lang: "CTA", type: "inter", text: data.cta });
      }
      if (data.full) {
        generated.push({ lang: `Full (${platform})`, type: "cairo", text: data.full });
      }
      if (data.hashtags?.length) {
        generated.push({ lang: "Hashtags", type: "inter", text: data.hashtags.join(" ") });
      }

      if (generated.length === 0 && data.captions?.length) {
        data.captions.forEach((c: { hook: string; body: string; cta: string; hashtags: string[] }, i: number) => {
          generated.push({ lang: `Variant ${i + 1} — Hook`, type: "cairo", text: c.hook });
          generated.push({ lang: `Variant ${i + 1} — Body`, type: "inter", text: c.body });
          if (c.cta) generated.push({ lang: `Variant ${i + 1} — CTA`, type: "inter", text: c.cta });
          if (c.hashtags?.length) generated.push({ lang: `Variant ${i + 1} — Hashtags`, type: "inter", text: c.hashtags.join(" ") });
        });
      }

      if (generated.length === 0) {
        throw new Error("No captions generated");
      }

      setOutputs(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-space">
            Product / Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. premium abaya, skincare serum, wireless earphones..."
            className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl h-11 px-3 text-xs text-[var(--text-primary)] font-inter placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-space">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl h-11 px-3 text-xs text-[var(--text-primary)] font-inter outline-none focus:border-[var(--accent)] transition-colors appearance-none"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-space">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl h-11 px-3 text-xs text-[var(--text-primary)] font-inter outline-none focus:border-[var(--accent)] transition-colors appearance-none"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-space">
            Price (optional)
          </label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 49 TND"
            className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl h-11 px-3 text-xs text-[var(--text-primary)] font-inter placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full h-12 bg-[var(--accent)] text-[var(--bg-base)] font-space font-bold rounded-xl text-xs flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "GENERATING..." : "ENGAGE CAPTION ENGINE"}
        </button>

        {initialProfile && (
          <p className="text-[9px] text-[var(--text-tertiary)] font-inter text-center">
            Using brand profile: {initialProfile.niche || "general"} · {initialProfile.brandTone || "default"} tone
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] p-3">
          <p className="text-xs text-[var(--status-danger)] font-inter font-medium">{error}</p>
        </div>
      )}

      {outputs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-space">
            Generated Conversion Assets
          </h3>
          {outputs.map((item, index) => (
            <div key={index} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold bg-[var(--bg-surface)] text-[var(--accent)] px-2 py-0.5 rounded font-space uppercase tracking-wider">
                  {item.lang}
                </span>
                <button
                  onClick={() => handleCopy(item.text, index)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-end"
                >
                  {copiedIndex === index ? <Check className="h-3.5 w-3.5 text-[var(--status-success)]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className={`text-xs text-[var(--text-primary)] leading-relaxed ${item.type === "cairo" ? "font-cairo" : "font-inter"}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

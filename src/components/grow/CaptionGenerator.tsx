"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Caption {
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
  full: string;
}

interface BrandProfile {
  niche: string;
  audience: string;
  brandTone: string;
  usp: string;
}

const TONES = [
  { id: "calm", labelKey: "tone.calm" },
  { id: "funny", labelKey: "tone.funny" },
  { id: "inspirational", labelKey: "tone.inspirational" },
  { id: "strong", labelKey: "tone.strong" },
];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "facebook", label: "Facebook", emoji: "👍" },
];

const NICHES = [
  { id: "clothing" },
  { id: "cosmetics" },
  { id: "accessories" },
  { id: "perfume" },
  { id: "natural" },
  { id: "food" },
  { id: "other" },
] as const;

const BRAND_VIBES = [
  { id: "playful", emoji: "😂", labelKey: "bp.q3-playful" },
  { id: "elegant", emoji: "✨", labelKey: "bp.q3-elegant" },
  { id: "trustworthy", emoji: "💪", labelKey: "bp.q3-trustworthy" },
];

function loadProfile(): BrandProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const d = localStorage.getItem("ugzio_brand_profile");
    return d ? (JSON.parse(d) as BrandProfile) : null;
  } catch {
    return null;
  }
}

export default function CaptionGenerator() {
  const { t } = useLanguage();
  const [topic, setTopic] = useState("");
  const [price, setPrice] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("calm");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [profile, setProfile] = useState<BrandProfile | null>(() => loadProfile());
  const [showProfileForm, setShowProfileForm] = useState(() => !loadProfile());

  const [formNiche, setFormNiche] = useState<string>("clothing");
  const [formAudience, setFormAudience] = useState("");
  const [formBrandVibe, setFormBrandVibe] = useState("playful");
  const [formUsp, setFormUsp] = useState("");

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
    setShowImageMenu(false);
  }

  function clearImage() {
    setImagePreview(null);
  }

  function saveProfile() {
    const p: BrandProfile = {
      niche: formNiche,
      audience: formAudience.trim(),
      brandTone: formBrandVibe,
      usp: formUsp.trim(),
    };
    setProfile(p);
    localStorage.setItem("ugzio_brand_profile", JSON.stringify(p));
    setShowProfileForm(false);
  }

  function openProfileForm() {
    if (profile) {
      setFormNiche(profile.niche);
      setFormAudience(profile.audience);
      setFormBrandVibe(profile.brandTone);
      setFormUsp(profile.usp);
    }
    setShowProfileForm(true);
  }

  async function fetchCaptions(): Promise<Caption[]> {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: topic.trim(),
        tone,
        platform,
        price: price.trim(),
        link: link.trim() || undefined,
        brand: profile || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data.captions;
  }

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setCaptions([]);
    try {
      setCaptions(await fetchCaptions());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("cg.error"));
    } finally {
      setLoading(false);
    }
  }

  async function regenerateSingle(index: number) {
    setRegeneratingIndex(index);
    try {
      const fresh = await fetchCaptions();
      if (fresh.length > 0) {
        setCaptions((prev) => {
          const next = [...prev];
          next[index] = fresh[0];
          return next;
        });
      }
    } catch {
      /* silent */
    } finally {
      setRegeneratingIndex(null);
    }
  }

  async function copy(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          {profile && (
            <button
              type="button"
              onClick={openProfileForm}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 px-4 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-300"
            >
              <span>✏️</span>
              <span>{t("cg.edit-profile")}</span>
            </button>
          )}
        </header>

        <div className="space-y-8">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder={t("cg.topic-placeholder")}
            className="w-full border-0 border-b-2 border-zinc-800 bg-transparent px-2 py-4 text-center text-2xl text-zinc-100 placeholder-zinc-700 outline-none transition focus:border-green-400 sm:text-3xl"
          />

          <div className="flex justify-center">
            <div className="flex w-full max-w-[200px] items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 transition focus-within:border-green-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                TND
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.000"
                className="min-w-0 flex-1 border-0 bg-transparent py-1 text-right text-lg text-zinc-100 placeholder-zinc-700 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />
              <input ref={galleryRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

              {imagePreview ? (
                <div className="group relative flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/50">
                  <div className="h-full w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${imagePreview})` }} />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400 transition hover:bg-red-600 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowImageMenu((v) => !v)}
                    className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 transition hover:border-zinc-500"
                  >
                    <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </button>

                  {showImageMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowImageMenu(false)} />
                      <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-44 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/40">
                        <button
                          type="button"
                          onClick={() => { cameraRef.current?.click(); }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800"
                        >
                          <span className="text-base">📷</span>
                          <span>{t("cg.take-photo")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { galleryRef.current?.click(); }}
                          className="flex w-full items-center gap-3 border-t border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800"
                        >
                          <span className="text-base">🖼️</span>
                          <span>{t("cg.upload-gallery")}</span>
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 transition focus-within:border-green-400">
              <svg className="h-4 w-4 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.57a4.5 4.5 0 00-7.243-1.244l-4.5 4.5a4.5 4.5 0 006.364 6.364l1.758-1.757" />
              </svg>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={t("cg.link-placeholder")}
                className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
              />
            </div>
          </div>

          <div>
            <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
              {t("cg.platform-label")}
            </p>
            <div className="flex justify-center gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                    platform === p.id
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                      : "border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-base">{p.emoji}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
              {t("cg.tone-label")}
            </p>
            <div className="flex justify-center gap-2">
              {TONES.map((toneOpt) => (
                <button
                  key={toneOpt.id}
                  onClick={() => setTone(toneOpt.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                    tone === toneOpt.id
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                      : "border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  {t(toneOpt.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="mt-10 flex w-full items-center justify-center gap-3 rounded-xl bg-green-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-green-500/20 transition hover:bg-green-400 hover:shadow-green-500/30 disabled:cursor-not-allowed disabled:opacity-40"
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
                {t("cg.generate-loading")}
              </>
            ) : (
              t("cg.generate")
            )}
          </button>

          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-3.5 text-sm text-red-400">
              {error}
            </div>
          )}

          {captions.length > 0 && (
            <div className="space-y-4 pt-4">
              {captions.map((caption, i) => (
                <div
                  key={i}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700"
                >
                  {imagePreview && (
                    <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800">
                      <div className="h-40 w-full bg-cover bg-center sm:h-48" style={{ backgroundImage: `url(${imagePreview})` }} />
                    </div>
                  )}
                  <div className="space-y-3">
                    <p className="text-base leading-relaxed text-zinc-100 sm:text-lg">
                      {caption.hook && (
                        <span className="font-semibold text-green-200">
                          {caption.hook}
                        </span>
                      )}
                      {caption.hook && caption.body && <br />}
                      {caption.body && (
                        <span>{caption.body}</span>
                      )}
                    </p>
                    {caption.cta && (
                      <p className="text-sm font-medium text-pink-300/80">
                        {caption.cta}
                      </p>
                    )}
                    {link && (
                      <p className="truncate text-xs text-green-400/50">
                        {link}
                      </p>
                    )}
                    {caption.hashtags.length > 0 && (
                      <p className="text-sm text-green-400/70">
                        {caption.hashtags.join("  ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
                    <button
                      onClick={() => copy(caption.full, i)}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-800 hover:text-green-400"
                    >
                      {copiedIndex === i ? (
                        t("cg.copied")
                      ) : (
                        <>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                          {t("cg.copy")}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => regenerateSingle(i)}
                      disabled={regeneratingIndex === i}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40"
                    >
                      <svg
                        className={`h-4 w-4 ${regeneratingIndex === i ? "animate-spin" : ""}`}
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
                      {regeneratingIndex === i ? "..." : t("cg.regenerate")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showProfileForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">
            <div className="mb-8 text-center">
              <p className="text-lg text-zinc-400">{t("bp.welcome")}</p>
              <p className="mt-1 text-sm text-zinc-600">
                {t("bp.subtitle")}
              </p>
            </div>

            <div className="space-y-7">
              <div>
                <label className="mb-2.5 block text-base font-medium text-zinc-200">
                  {t("bp.q1")}
                </label>
                <select
                  value={formNiche}
                  onChange={(e) => setFormNiche(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3.5 text-sm text-zinc-100 outline-none transition focus:border-green-400"
                >
                  {NICHES.map((n) => (
                    <option key={n.id} value={n.id} className="bg-zinc-900">
                      {t(`niche.${n.id}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2.5 block text-base font-medium text-zinc-200">
                  {t("bp.q2")}
                </label>
                <input
                  type="text"
                  value={formAudience}
                  onChange={(e) => setFormAudience(e.target.value)}
                  placeholder={t("bp.q2-placeholder")}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-green-400"
                />
              </div>

              <div>
                <label className="mb-3 block text-base font-medium text-zinc-200">
                  {t("bp.q3")}
                </label>
                <div className="flex flex-col gap-2">
                  {BRAND_VIBES.map((bv) => (
                    <button
                      key={bv.id}
                      type="button"
                      onClick={() => setFormBrandVibe(bv.id)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                        formBrandVibe === bv.id
                          ? "border-green-500 bg-green-500/10 text-green-300 shadow-sm shadow-green-500/20"
                          : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xl">{bv.emoji}</span>
                      <span>{t(bv.labelKey)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-base font-medium text-zinc-200">
                  {t("bp.q4")}
                </label>
                <input
                  type="text"
                  value={formUsp}
                  onChange={(e) => setFormUsp(e.target.value)}
                  placeholder={t("bp.q4-placeholder")}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-green-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={saveProfile}
              className="mt-8 w-full rounded-xl bg-green-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-green-500/20 transition hover:bg-green-400"
            >
              {t("bp.submit")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

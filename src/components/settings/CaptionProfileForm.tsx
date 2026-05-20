"use client";

import { useState, useEffect } from "react";

const BRAND_TONES = [
  { value: "funny_close", labelAr: "قريب و مضحك", labelFr: "Proche & Drôle", labelEn: "Funny & Close" },
  { value: "elegant_refined", labelAr: "راقي و أنيق", labelFr: "Élégant & Raffiné", labelEn: "Elegant & Refined" },
  { value: "direct_clear", labelAr: "مباشر و واضح", labelFr: "Direct & Clair", labelEn: "Direct & Clear" },
];

export default function CaptionProfileForm() {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [brandTone, setBrandTone] = useState("funny_close");
  const [usp, setUsp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/v1/caption-profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setNiche(data.profile.niche ?? "");
            setAudience(data.profile.audience ?? "");
            setBrandTone(data.profile.brandTone ?? "funny_close");
            setUsp(data.profile.usp ?? "");
          }
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/v1/caption-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), audience: audience.trim(), brandTone, usp: usp.trim() }),
      });
      if (!res.ok) { setError("فشل الحفظ"); return; }
      setSuccess(true);
    } catch { setError("خطأ في الشبكة"); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="text-xs text-[var(--text-tertiary)] py-2">جاري التحميل...</div>;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">بروفيل الكابتشين</h3>
      <p className="text-xs text-[var(--text-tertiary)]">
        هذي المعلومات تخلّي الكابتشينات تاعك تكون مخصصة لعلامتك التجارية. تستعمل في ZioBrain.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">تخصصك (Niche)</label>
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="مثال: عباية, عطور, زيت زيتون..."
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">الجمهور المستهدف</label>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="مثال: بنات 20-35 سنة, عرسان..."
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)]">نغمة العلامة التجارية</label>
        <div className="mt-1 flex gap-2 flex-wrap">
          {BRAND_TONES.map((t) => (
            <button
              key={t.value}
              onClick={() => setBrandTone(t.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                brandTone === t.value
                  ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/30"
              }`}
            >
              {t.labelAr}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)]">ميزتك التنافسية (USP)</label>
        <textarea
          value={usp}
          onChange={(e) => setUsp(e.target.value)}
          placeholder="شنو يخلّي منتوجك مختلف؟ مثال: طبيعي 100%, توصيل مجاني في 24 ساعة..."
          rows={2}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50 resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent)]/90 disabled:opacity-50 transition-colors"
      >
        {saving ? "جاري الحفظ..." : "حفظ بروفيل الكابتشين"}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-green-400">تم الحفظ ✓</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, UploadCloud } from "lucide-react";

export default function CaptionEngine() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const outputs = [
    { lang: "Tunisian Darija", type: "cairo", text: "العباية اللي تخليك مرتاحة وفخمة في نفس الوقت 🖤 متوفرة توا في تونس التوصيل لجميع الولايات 🇹🇳" },
    { lang: "French", type: "inter", text: "Simple. Elégant. Puissant. ✨ Disponible en livraison rapide partout en Tunisie." },
    { lang: "Urgency Target", type: "inter", text: "Stock limité ! 🔥 Commander maintenant et recevez votre colis sous 48h." }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-space text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          ZioFlow <span className="text-[var(--accent)]">Caption Engine</span>
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-inter mt-1">
          Turn your products into high-conversion social assets instantly.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-space">
            Product Visual Asset
          </label>
          <div className="flex flex-col items-center justify-center border border-dashed border-[var(--border)] rounded-lg p-5 bg-[var(--bg-surface)]/50 min-h-[100px] active:border-[var(--accent)]/50 transition-colors">
            <UploadCloud className="h-5 w-5 text-[var(--text-muted)] mb-1" />
            <p className="text-xs text-[var(--text-tertiary)] font-inter">Tap to upload product image</p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-space">
            Core Target Tone
          </label>
          <select className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg h-11 px-3 text-xs text-[var(--text-primary)] font-inter focus:border-[var(--accent)] outline-none appearance-none">
            <option>Luxury / Premium</option>
            <option>Streetwear Hustle</option>
            <option>Urgent / FOMO</option>
          </select>
        </div>

        <button
          onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 1500); }}
          className="w-full h-12 bg-[var(--accent)] text-[var(--bg-base)] font-space font-bold rounded-lg text-xs flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "GENERATING ATTENTION..." : "ENGAGE CAPTION ENGINE"}
        </button>
      </div>

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
            <p className={item.type === "cairo" ? "text-xs text-[var(--text-primary)] font-cairo leading-relaxed" : "text-xs text-[var(--text-primary)]/80 font-inter leading-relaxed"}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, type ChangeEvent } from "react";

type Step = "store" | "platforms" | "product" | "whatsapp" | "done";

interface Errors {
  name?: string;
  category?: string;
  wilaya?: string;
  whatsappNumber?: string;
  platforms?: string;
  productName?: string;
  productPrice?: string;
  productStock?: string;
}

const STEPS: { key: Step; label: string }[] = [
  { key: "store", label: "Boutique" },
  { key: "platforms", label: "Réseaux" },
  { key: "product", label: "Produit" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "done", label: "En ligne" },
];

const WILAYAS = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia",
  "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
];

const CATEGORIES = [
  "Mode / Vêtements", "Cosmétique / Beauté", "Parfumerie",
  "Accessoires", "Électronique", "Alimentation / Épicerie",
  "Maison / Décoration", "Sport / Fitness", "Jouets / Enfants", "Autre",
];

const FEATURES = [
  "Protection revenue automatique",
  "Analyse risque en 3 secondes",
  "Séquences WhatsApp psychologiques",
  "Collection UGC automatique",
  "Dashboard mobile en temps réel",
  "Support WhatsApp prioritaire",
];

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full transition-all duration-500 ${
            i <= current ? "bg-[var(--accent)]" : "bg-[var(--border)]"
          }`}
        />
      ))}
    </div>
  );
}

function StepLabel({ current, total }: { current: number; total: number }) {
  return (
    <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider text-center mb-6">
      Étape {current + 1} / {total}
    </p>
  );
}

function Input({
  label, value, onChange, error, placeholder, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">
        {label} {required && <span className="text-[var(--risk-red)]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--accent)] ${
          error ? "border-[var(--risk-red)]/50" : "border-[var(--border)]"
        }`}
      />
      {error && <p className="text-[10px] text-[var(--risk-red)] mt-1">{error}</p>}
    </div>
  );
}

function Select({
  label, value, onChange, options, error, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; error?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">
        {label} {required && <span className="text-[var(--risk-red)]">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] ${
          error ? "border-[var(--risk-red)]/50" : "border-[var(--border)]"
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[10px] text-[var(--risk-red)] mt-1">{error}</p>}
    </div>
  );
}

export default function StoreSetupWizard() {
  const [step, setStep] = useState<Step>("store");
  const [errors, setErrors] = useState<Errors>({});

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [platformsSkipped, setPlatformsSkipped] = useState(false);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productPhotoPreview, setProductPhotoPreview] = useState<string | null>(null);
  const [productWhatsAppOrder, setProductWhatsAppOrder] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const [qrScanned, setQrScanned] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function clearError(field: keyof Errors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validateStore(): boolean {
    const e: Errors = {};
    if (!name.trim()) e.name = "Le nom de la boutique est requis";
    if (!category) e.category = "Sélectionne une catégorie";
    if (!wilaya) e.wilaya = "Sélectionne une wilaya";
    if (!whatsappNumber.trim()) e.whatsappNumber = "Le numéro WhatsApp est requis";
    else if (!/^(\+216)?[0-9]{8,}$/.test(whatsappNumber.replace(/\s/g, "")))
      e.whatsappNumber = "Numéro invalide (ex: +216 XX XXX XXX)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validatePlatforms(): boolean {
    if (platformsSkipped) return true;
    const hasAny = instagram.trim() || facebook.trim() || tiktok.trim();
    if (!hasAny) {
      setErrors({ platforms: "Ajoute au moins un réseau ou clique « Passer »" });
      return false;
    }
    return true;
  }

  function validateProduct(): boolean {
    const e: Errors = {};
    if (!productName.trim()) e.productName = "Le nom du produit est requis";
    if (!productPrice.trim()) e.productPrice = "Le prix est requis";
    else if (isNaN(Number(productPrice)) || Number(productPrice) <= 0)
      e.productPrice = "Prix invalide";
    if (!productStock.trim()) e.productStock = "Le stock est requis";
    else if (isNaN(Number(productStock)) || Number(productStock) < 0)
      e.productStock = "Stock invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (step === "store" && !validateStore()) return;
    if (step === "platforms" && !validatePlatforms()) return;
    if (step === "product" && !validateProduct()) return;
    setErrors({});
    const idx = stepIndex;
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  }

  function handleBack() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key);
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProductPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleScanQR() {
    setQrScanned(true);
  }

  return (
    <div className="w-full max-w-[32rem] mx-auto">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-8">
        <ProgressBar current={stepIndex} total={STEPS.length} />
        <StepLabel current={stepIndex} total={STEPS.length} />

        {step === "store" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Infos boutique</h2>
            <p className="text-xs text-[var(--text-secondary)]">Configure les informations de ta boutique</p>
            <Input
              label="Nom de la boutique"
              value={name}
              onChange={(v) => { setName(v); clearError("name"); }}
              placeholder="ex: Ma Boutique Tunis"
              required
              error={errors.name}
            />
            <Select
              label="Catégorie"
              value={category}
              onChange={(v) => { setCategory(v); clearError("category"); }}
              options={[{ value: "", label: "Sélectionne une catégorie" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
              required
              error={errors.category}
            />
            <Select
              label="Wilaya"
              value={wilaya}
              onChange={(v) => { setWilaya(v); clearError("wilaya"); }}
              options={[{ value: "", label: "Sélectionne une wilaya" }, ...WILAYAS.map((w) => ({ value: w, label: w }))]}
              required
              error={errors.wilaya}
            />
            <Input
              label="Numéro WhatsApp"
              value={whatsappNumber}
              onChange={(v) => { setWhatsappNumber(v); clearError("whatsappNumber"); }}
              placeholder="+216 XX XXX XXX"
              type="tel"
              required
              error={errors.whatsappNumber}
            />
          </div>
        )}

        {step === "platforms" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Connecte tes réseaux</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Au moins un réseau requis. Ajoute tes URLs ou clique « Passer » pour plus tard.
            </p>
            <Input
              label="Instagram"
              value={instagram}
              onChange={(v) => { setInstagram(v); clearError("platforms"); }}
              placeholder="https://instagram.com/ta_boutique"
            />
            <Input
              label="Facebook"
              value={facebook}
              onChange={(v) => { setFacebook(v); clearError("platforms"); }}
              placeholder="https://facebook.com/ta_boutique"
            />
            <Input
              label="TikTok"
              value={tiktok}
              onChange={(v) => { setTiktok(v); clearError("platforms"); }}
              placeholder="https://tiktok.com/@ta_boutique"
            />
            {errors.platforms && (
              <p className="text-[10px] text-[var(--risk-red)]">{errors.platforms}</p>
            )}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="skip-platforms"
                checked={platformsSkipped}
                onChange={(e) => { setPlatformsSkipped(e.target.checked); clearError("platforms"); }}
                className="rounded border-[var(--border)] bg-[var(--bg-surface)]"
              />
              <label htmlFor="skip-platforms" className="text-xs text-[var(--text-tertiary)]">
                Passer — je ferai ça plus tard
              </label>
            </div>
          </div>
        )}

        {step === "product" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Ajoute ton premier produit</h2>
            <p className="text-xs text-[var(--text-secondary)]">Un seul produit suffit pour commencer</p>
            <Input
              label="Nom du produit"
              value={productName}
              onChange={(v) => { setProductName(v); clearError("productName"); }}
              placeholder="ex: Sac à main en cuir"
              required
              error={errors.productName}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Prix (TND)"
                value={productPrice}
                onChange={(v) => { setProductPrice(v); clearError("productPrice"); }}
                placeholder="ex: 89"
                type="number"
                required
                error={errors.productPrice}
              />
              <Input
                label="Stock"
                value={productStock}
                onChange={(v) => { setProductStock(v); clearError("productStock"); }}
                placeholder="ex: 50"
                type="number"
                required
                error={errors.productStock}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Photo du produit</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-4 text-center cursor-pointer hover:border-[var(--accent)]/50 transition-colors"
              >
                {productPhotoPreview ? (
                  <img src={productPhotoPreview} alt="Preview" className="mx-auto max-h-32 rounded-lg object-cover" />
                ) : (
                  <div className="py-4">
                    <p className="text-sm text-[var(--text-tertiary)]">Clique pour ajouter une photo</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">PNG, JPG • Max 5 Mo</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <label className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 cursor-pointer hover:border-[var(--accent)]/30 transition-colors">
              <input
                type="checkbox"
                checked={productWhatsAppOrder}
                onChange={(e) => setProductWhatsAppOrder(e.target.checked)}
                className="rounded border-[var(--border)] bg-[var(--bg-surface)]"
              />
              <div>
                <p className="text-sm text-[var(--text-primary)]">WhatsApp pour les commandes</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">Les clients peuvent commander via WhatsApp</p>
              </div>
            </label>
          </div>
        )}

        {step === "whatsapp" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Active WhatsApp</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Scanne le QR code pour connecter ton WhatsApp et tester la réponse automatique
            </p>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center">
              <div className="mx-auto w-40 h-40 rounded-lg bg-white p-3 flex items-center justify-center mb-4">
                <div className="w-full h-full bg-[var(--text-tertiary)]/20 rounded flex items-center justify-center">
                  {qrScanned ? (
                    <span className="text-4xl">✅</span>
                  ) : (
                    <div className="text-center">
                      <div className="grid grid-cols-5 gap-0.5 w-24 mx-auto mb-2">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-[1px]"
                            style={{
                              backgroundColor: Math.random() > 0.5 ? "var(--text-primary)" : "transparent",
                              opacity: 0.3,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-[8px] text-[var(--text-tertiary)]">QR Code simulé</p>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleScanQR}
                disabled={qrScanned}
                className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
              >
                {qrScanned ? "✓ WhatsApp connecté" : "Simuler le scan QR"}
              </button>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
                Dans la vraie configuration, tu scannes le QR avec WhatsApp
              </p>
            </div>
            {qrScanned && (
              <div className="rounded-lg border border-[var(--success-green)]/20 bg-[var(--success-green)]/5 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">✅</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--success-green)]">Réponse automatique testée</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">WhatsApp répond maintenant automatiquement aux clients</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-[var(--success-green)]/10 border border-[var(--success-green)]/20 flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Votre boutique est en ligne!</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {name || "Ma Boutique"} est prête à protéger ton revenue
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Lien de ta boutique</p>
              <p className="text-sm font-medium text-[var(--accent)] break-all">
                ugzio.io/store/{name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "ma-boutique"}
              </p>
            </div>
            <div className="text-left">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-3 font-medium">
                Fonctionnalités activées
              </p>
              <div className="space-y-2">
                {FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--success-green)]/10 shrink-0">
                      <span className="text-[8px] text-[var(--success-green)]">✓</span>
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <a
              href="/overview"
              className="block w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors text-center"
            >
              Aller au tableau de bord
            </a>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              Commence à importer tes commandes et activer la protection revenue
            </p>
          </div>
        )}

        {step !== "done" && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--border)]">
            <button
              onClick={handleBack}
              disabled={stepIndex === 0}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Retour
            </button>
            <button
              onClick={handleNext}
              className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              {stepIndex === STEPS.length - 2 ? "Terminer" : "Suivant"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

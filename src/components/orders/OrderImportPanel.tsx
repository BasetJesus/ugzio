"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
}

const REQUIRED_COLUMNS = [
  "customerName",
  "phone",
  "amount",
  "city",
  "product",
  "deliveryProvider",
] as const;

type ImportMode = "csv" | "sheets" | "excel";
type Step = "idle" | "validating" | "ready" | "importing" | "success" | "error";

interface ValidationResult {
  valid: boolean;
  rowCount: number;
  errors: ImportValidationError[];
}

interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: ImportValidationError[];
  orderIds: string[];
}

export default function OrderImportPanel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<ImportMode>("csv");
  const [step, setStep] = useState<Step>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  function reset() {
    setStep("idle");
    setFileName("");
    setFileContent("");
    setSheetsUrl("");
    setValidation(null);
    setResult(null);
    setError("");
  }

  async function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setFileName(file.name);
    setError("");
    setStep("validating");

    try {
      const content = await file.text();
      setFileContent(content);

      const formData = new FormData();
      formData.append("file", new Blob([content], { type: "text/csv" }), file.name);

      const res = await fetch("/api/v1/orders/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.validation) {
        setValidation({
          valid: data.validation.valid,
          rowCount: data.validation.rowCount,
          errors: data.validation.errors || [],
        });
        if (data.validation.valid) {
          setStep("ready");
        } else {
          setStep("error");
        }
      } else if (res.ok && data.importedCount !== undefined) {
        setResult(data);
        setStep("success");
        router.refresh();
      } else {
        setError(data.error || "Validation failed");
        setStep("error");
      }
    } catch {
      setError("Failed to read file");
      setStep("error");
    }
  }

  async function handleFetchSheet() {
    if (!sheetsUrl.trim()) {
      setError("Colle le lien de ton Google Sheets");
      return;
    }

    setError("");
    setStep("validating");
    setFileName("Google Sheets");

    try {
      let csvUrl = sheetsUrl.trim();
      if (csvUrl.includes("/edit")) {
        csvUrl = csvUrl.replace(/\/edit.*/, "/export?format=csv");
      } else if (!csvUrl.includes("export?format=csv") && !csvUrl.includes("pub?output=csv")) {
        if (csvUrl.includes("pub")) {
          csvUrl = csvUrl.includes("?") ? `${csvUrl}&output=csv` : `${csvUrl}?output=csv`;
        } else {
          csvUrl = csvUrl.endsWith("/") ? `${csvUrl}export?format=csv` : `${csvUrl}/export?format=csv`;
        }
      }

      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csvText = await res.text();
      if (csvText.length < 10) throw new Error("Le fichier semble vide");

      setFileContent(csvText);

      const formData = new FormData();
      formData.append("file", new Blob([csvText], { type: "text/csv" }), "google-sheets.csv");

      const importRes = await fetch("/api/v1/orders/import", {
        method: "POST",
        body: formData,
      });

      const data = await importRes.json();

      if (data.validation) {
        setValidation({
          valid: data.validation.valid,
          rowCount: data.validation.rowCount,
          errors: data.validation.errors || [],
        });
        setStep(data.validation.valid ? "ready" : "error");
      } else if (importRes.ok && data.importedCount !== undefined) {
        setResult(data);
        setStep("success");
        router.refresh();
      } else {
        setError(data.error || "Échec de la récupération");
        setStep("error");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Lien invalide";
      setError(msg.includes("fetch") ? "Impossible d'accéder au lien. Vérifie que ton Google Sheets est publié." : msg);
      setStep("error");
    }
  }

  async function handleExcelFile(file: File) {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      setError("Veuillez uploader un fichier Excel (.xlsx ou .xls)");
      return;
    }

    setFileName(file.name);
    setError("");
    setStep("validating");

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const csvText = XLSX.utils.sheet_to_csv(sheet);

      if (csvText.length < 10) throw new Error("Le fichier semble vide");

      setFileContent(csvText);

      const formData = new FormData();
      formData.append("file", new Blob([csvText], { type: "text/csv" }), file.name.replace(/\.xlsx?$/, ".csv"));

      const res = await fetch("/api/v1/orders/import", { method: "POST", body: formData });
      const data = await res.json();

      if (data.validation) {
        setValidation({
          valid: data.validation.valid,
          rowCount: data.validation.rowCount,
          errors: data.validation.errors || [],
        });
        setStep(data.validation.valid ? "ready" : "error");
      } else if (res.ok && data.importedCount !== undefined) {
        setResult(data);
        setStep("success");
        router.refresh();
      } else {
        setError(data.error || "Échec de la validation");
        setStep("error");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur de lecture";
      setError(msg.includes("fetch") ? "Impossible de lire le fichier" : msg);
      setStep("error");
    }
  }

  async function handleImport() {
    setStep("importing");

    try {
      const formData = new FormData();
      formData.append("file", new Blob([fileContent], { type: "text/csv" }), fileName);

      const res = await fetch("/api/v1/orders/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setStep("success");
        router.refresh();
      } else {
        setError(data.error || "Import failed");
        setStep("error");
      }
    } catch {
      setError("Network error");
      setStep("error");
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  if (step === "idle") {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Importer des commandes</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Ajoute tes commandes depuis un fichier CSV, Excel ou Google Sheets</p>
        </div>

        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden mb-6">
          <button
            onClick={() => { setMode("csv"); reset(); }}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              mode === "csv"
                ? "bg-[var(--accent)] text-white"
                : "bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Fichier CSV
          </button>
          <button
            onClick={() => { setMode("sheets"); reset(); }}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              mode === "sheets"
                ? "bg-[var(--accent)] text-white"
                : "bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Google Sheets
          </button>
          <button
            onClick={() => { setMode("excel"); reset(); }}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              mode === "excel"
                ? "bg-[var(--accent)] text-white"
                : "bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Excel
          </button>
        </div>

        {mode === "csv" ? (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--border)] hover:border-[var(--border)]/70"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="hidden"
              />
              <div className="text-4xl mb-3">📄</div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Dépose ton fichier CSV ici, ou clique pour naviguer</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Supporte : .csv</p>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
                {error}
              </div>
            )}
          </>
        ) : mode === "excel" ? (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleExcelFile(file); }}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--border)] hover:border-[var(--border)]/70"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) handleExcelFile(file); }}
                className="hidden"
              />
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Dépose ton fichier Excel ici, ou clique pour naviguer</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Supporte : .xlsx, .xls</p>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)]">Lien Google Sheets</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="url"
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
                />
                <button
                  onClick={handleFetchSheet}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Récupérer
                </button>
              </div>
            </div>

            <details className="rounded-lg bg-[var(--bg-surface)] p-3">
              <summary className="text-[10px] text-[var(--text-tertiary)] cursor-pointer hover:text-[var(--text-secondary)]">
                Comment obtenir le lien ?
              </summary>
              <ol className="mt-2 space-y-1 text-[10px] text-[var(--text-tertiary)] list-decimal list-inside">
                <li>Ouvre ton Google Sheets</li>
                <li>Fichier → Partager → Publier sur le web</li>
                <li>Choisis &ldquo;Valeur séparées par des virgules (.csv)&rdquo;</li>
                <li>Copie le lien et colle-le ici</li>
              </ol>
            </details>

            {error && (
              <div className="rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 rounded-lg bg-[var(--bg-surface)]">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Colonnes requises</p>
          <div className="flex flex-wrap gap-2">
            {REQUIRED_COLUMNS.map((col) => (
              <span key={col} className="px-2 py-1 rounded bg-[var(--border)] text-xs text-[var(--text-secondary)]">
                {col}
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Exemple : customerName, phone, amount, city, product, deliveryProvider
          </p>
        </div>
      </div>
    );
  }

  if (step === "validating" || step === "importing") {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
        <div className="animate-pulse text-4xl mb-4">{step === "importing" ? "▣" : "◎"}</div>
        <p className="text-base font-medium text-[var(--text-primary)]">
          {step === "importing" ? "Importation en cours..." : "Vérification..."}
        </p>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">{fileName}</p>
      </div>
    );
  }

  if (step === "ready") {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="text-2xl text-[var(--success-green)]">●</div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Prêt à importer</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{fileName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg bg-[var(--bg-surface)] p-4">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Commandes trouvées</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{validation?.rowCount ?? 0}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-surface)] p-4">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Validation</p>
            <p className="text-2xl font-bold text-[var(--success-green)]">OK</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]/30 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Importer {validation?.rowCount ?? 0} commandes
          </button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="rounded-xl border border-[var(--success-green-border)] bg-[var(--success-green-bg)] p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="text-2xl text-[var(--success-green)]">◆</div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--success-green)]">Importation réussie</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {result?.importedCount ?? 0} commandes ajoutées à tes opérations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg bg-[var(--bg-surface)] p-4">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Importées</p>
            <p className="text-2xl font-bold text-[var(--success-green)]">{result?.importedCount ?? 0}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-surface)] p-4">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Échouées</p>
            <p className={`text-2xl font-bold ${(result?.failedCount ?? 0) > 0 ? "text-[var(--risk-red)]" : "text-[var(--text-tertiary)]"}`}>
              {result?.failedCount ?? 0}
            </p>
          </div>
        </div>

        {result?.errors && result.errors.length > 0 && (
          <div className="mb-6 rounded-lg border border-[var(--warning-amber-border)] bg-[var(--warning-amber-bg)] p-4">
            <p className="text-xs font-medium text-[var(--warning-amber)] uppercase tracking-wider mb-2">Avertissements</p>
            <ul className="space-y-1">
              {result.errors.slice(0, 5).map((err, i) => (
                <li key={i} className="text-xs text-[var(--text-secondary)]">
                  Ligne {err.row}: {err.message}
                </li>
              ))}
              {result.errors.length > 5 && (
                <li className="text-xs text-[var(--text-tertiary)]">... et {result.errors.length - 5} autres</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]/30 transition-colors"
          >
            Importer plus
          </button>
          <a
            href="/overview"
            className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors text-center"
          >
            Voir le tableau de bord
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="text-2xl text-[var(--risk-red)]">△</div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--risk-red)]">Validation échouée</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{error || "Corrige les erreurs ci-dessous"}</p>
        </div>
      </div>

      {validation?.errors && validation.errors.length > 0 && (
        <div className="mb-6 max-h-64 overflow-y-auto">
          <ul className="space-y-2">
            {validation.errors.map((err, i) => (
              <li key={i} className="rounded bg-[var(--bg-surface)] p-3">
                  <span className="text-xs font-medium text-[var(--risk-red)]">Ligne {err.row}</span>
                <span className="text-xs text-[var(--text-tertiary)] mx-2">•</span>
                <span className="text-xs text-[var(--text-secondary)]">{err.field}: {err.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-4 rounded-lg bg-[var(--bg-surface)] mb-6">
        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Colonnes requises</p>
        <div className="flex flex-wrap gap-2">
          {REQUIRED_COLUMNS.map((col) => (
            <span key={col} className="px-2 py-1 rounded bg-[var(--border)] text-xs text-[var(--text-secondary)]">
              {col}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={reset}
        className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}

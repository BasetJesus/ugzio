"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

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
  const [step, setStep] = useState<Step>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  function reset() {
    setStep("idle");
    setFileName("");
    setFileContent("");
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
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Import Orders</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Upload a CSV file with your order data</p>
        </div>

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
          <div className="text-4xl mb-3">▣</div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Drop your CSV file here, or click to browse</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Supports: .csv</p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
            {error}
          </div>
        )}

        <div className="mt-6 p-4 rounded-lg bg-[var(--bg-surface)]">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Required CSV columns</p>
          <div className="flex flex-wrap gap-2">
            {REQUIRED_COLUMNS.map((col) => (
              <span key={col} className="px-2 py-1 rounded bg-[var(--border)] text-xs text-[var(--text-secondary)]">
                {col}
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Example: customerName, phone, amount, city, product, deliveryProvider
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
          {step === "importing" ? "Importing orders..." : "Validating CSV..."}
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
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Ready to Import</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{fileName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg bg-[var(--bg-surface)] p-4">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Orders found</p>
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
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="flex-1 rounded-lg bg-[var(--btn-green)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--btn-green-hover)] transition-colors"
          >
            Import {validation?.rowCount ?? 0} Orders
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
            <h2 className="text-lg font-semibold text-[var(--success-green)]">Import Complete</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {result?.importedCount ?? 0} orders added to your operations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg bg-[var(--bg-surface)] p-4">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Imported</p>
            <p className="text-2xl font-bold text-[var(--success-green)]">{result?.importedCount ?? 0}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-surface)] p-4">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Failed</p>
            <p className={`text-2xl font-bold ${(result?.failedCount ?? 0) > 0 ? "text-[var(--risk-red)]" : "text-[var(--text-tertiary)]"}`}>
              {result?.failedCount ?? 0}
            </p>
          </div>
        </div>

        {result?.errors && result.errors.length > 0 && (
          <div className="mb-6 rounded-lg border border-[var(--warning-amber-border)] bg-[var(--warning-amber-bg)] p-4">
            <p className="text-xs font-medium text-[var(--warning-amber)] uppercase tracking-wider mb-2">Warnings</p>
            <ul className="space-y-1">
              {result.errors.slice(0, 5).map((err, i) => (
                <li key={i} className="text-xs text-[var(--text-secondary)]">
                  Row {err.row}: {err.message}
                </li>
              ))}
              {result.errors.length > 5 && (
                <li className="text-xs text-[var(--text-tertiary)]">... and {result.errors.length - 5} more</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]/30 transition-colors"
          >
            Import More
          </button>
          <a
            href="/overview"
            className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors text-center"
          >
            Go to Overview
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
          <h2 className="text-lg font-semibold text-[var(--risk-red)]">Validation Failed</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{error || "Please fix the issues below"}</p>
        </div>
      </div>

      {validation?.errors && validation.errors.length > 0 && (
        <div className="mb-6 max-h-64 overflow-y-auto">
          <ul className="space-y-2">
            {validation.errors.map((err, i) => (
              <li key={i} className="rounded bg-[var(--bg-surface)] p-3">
                  <span className="text-xs font-medium text-[var(--risk-red)]">Row {err.row}</span>
                <span className="text-xs text-[var(--text-tertiary)] mx-2">•</span>
                <span className="text-xs text-[var(--text-secondary)]">{err.field}: {err.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-4 rounded-lg bg-[var(--bg-surface)] mb-6">
        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Required columns</p>
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
        Try Again
      </button>
    </div>
  );
}

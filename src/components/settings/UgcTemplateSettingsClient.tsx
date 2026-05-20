"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface UgcTemplate {
  id: string;
  organizationId: string;
  name: string;
  requestType: string;
  messageBody: string;
  incentive: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const REQUEST_TYPES: { value: string; label: string }[] = [
  { value: "photo_review", label: "Avis photo" },
  { value: "instagram_story", label: "Story Instagram" },
  { value: "tiktok_unboxing", label: "Déballage TikTok" },
  { value: "written_testimonial", label: "Témoignage écrit" },
  { value: "whatsapp_feedback", label: "Avis WhatsApp" },
];

const REQUEST_TYPE_ICONS: Record<string, string> = {
  photo_review: "📸",
  instagram_story: "📱",
  tiktok_unboxing: "🎬",
  written_testimonial: "📝",
  whatsapp_feedback: "💬",
};

type View = "list" | "create" | "edit";

export default function UgcTemplateSettingsClient() {
  const router = useRouter();
  const [view, setView] = useState<View>("list");
  const [templates, setTemplates] = useState<UgcTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formRequestType, setFormRequestType] = useState("photo_review");
  const [formMessageBody, setFormMessageBody] = useState("");
  const [formIncentive, setFormIncentive] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  async function loadTemplates() {
    try {
      const res = await fetch("/api/v1/settings/ugc-templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch {
      setError("Échec du chargement des modèles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTemplates();
  }, []);

  function openCreate() {
    setFormName("");
    setFormRequestType("photo_review");
    setFormMessageBody("");
    setFormIncentive("");
    setFormIsActive(true);
    setError("");
    setView("create");
  }

  function openEdit(t: UgcTemplate) {
    setSelectedId(t.id);
    setFormName(t.name);
    setFormRequestType(t.requestType);
    setFormMessageBody(t.messageBody);
    setFormIncentive(t.incentive);
    setFormIsActive(t.isActive);
    setError("");
    setView("edit");
  }

  function insertVariable(varName: string) {
    const placeholder = `{{${varName}}}`;
    setFormMessageBody((prev) => prev + placeholder);
  }

  async function handleCreate() {
    if (!formName.trim()) { setError("Le nom du modèle est requis"); return; }
    if (!formMessageBody.trim()) { setError("Le message est requis"); return; }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/v1/settings/ugc-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          requestType: formRequestType,
          messageBody: formMessageBody,
          incentive: formIncentive.trim(),
          isActive: formIsActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Échec de création du modèle");
        return;
      }

      setView("list");
      loadTemplates();
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!selectedId || !formName.trim()) { setError("Le nom du modèle est requis"); return; }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/settings/ugc-templates/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          requestType: formRequestType,
          messageBody: formMessageBody,
          incentive: formIncentive.trim(),
          isActive: formIsActive,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Échec de mise à jour du modèle");
        return;
      }

      setView("list");
      loadTemplates();
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteTarget(id);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);

    try {
      const res = await fetch(`/api/v1/settings/ugc-templates/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Échec de suppression");
        return;
      }

      loadTemplates();
      router.refresh();
    } catch {
      setError("Erreur réseau");
    }
  }

  const VARIABLE_BUTTONS = [
    { label: "Nom acheteur", value: "buyerName" },
    { label: "Produit", value: "product" },
    { label: "Montant commande", value: "orderAmount" },
    { label: "Incitation", value: "incentive" },
  ];

  if (view === "create" || view === "edit") {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {view === "create" ? "Ajouter un modèle" : "Modifier le modèle"}
          </h2>
          <button
            onClick={() => setView("list")}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          >
            ← Retour
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
            {error}
          </div>
        )}

        <div className="space-y-4 max-w-[32rem]">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Nom du modèle *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="ex: Photo avec 15 TND d'incitation"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Type de demande *
            </label>
            <select
              value={formRequestType}
              onChange={(e) => setFormRequestType(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {REQUEST_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {REQUEST_TYPE_ICONS[rt.value]} {rt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Message *
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {VARIABLE_BUTTONS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => insertVariable(v.value)}
                  className="rounded border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--accent)]/50 transition-colors"
                >
                  + {v.label}
                </button>
              ))}
            </div>
            <textarea
              value={formMessageBody}
              onChange={(e) => setFormMessageBody(e.target.value)}
              placeholder="Hey {{buyerName}}! Envoie-nous une photo de {{product}} et reçois {{incentive}} 🎁"
              rows={4}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Incitation (optionnel)
            </label>
            <input
              type="text"
              value={formIncentive}
              onChange={(e) => setFormIncentive(e.target.value)}
              placeholder="ex: 15 TND, 20 TND, mention"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="rounded border-[var(--border)] bg-[var(--bg-surface)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Actif (utilisé par défaut pour les nouvelles commandes)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setView("list")}
              className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]/30 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={view === "create" ? handleCreate : handleUpdate}
              disabled={saving}
              className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement..." : view === "create" ? "Créer le modèle" : "Mettre à jour"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Modèles de demande UGC</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Personnalisez les messages WhatsApp envoyés aux acheteurs 72h après la livraison
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          + Ajouter un modèle
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-4"><LoadingSkeleton variant="list" count={3} /></div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
          <div className="text-4xl mb-3 text-[var(--text-tertiary)]">💬</div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Aucun modèle UGC configuré</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Créez des modèles pour personnaliser le message WhatsApp des acheteurs 72h après la livraison
          </p>
          <button
            onClick={openCreate}
            className="mt-4 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Créer votre premier modèle
          </button>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Utilise un message par défaut si aucun modèle n&apos;est configuré
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`rounded-xl border p-4 transition-colors ${
                t.isActive
                  ? "border-[var(--accent)]/50 bg-[var(--accent)]/5"
                  : "border-[var(--border)] bg-[var(--bg-card)]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{REQUEST_TYPE_ICONS[t.requestType] ?? "📦"}</span>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</h3>
                    {t.isActive && (
                      <span className="rounded-full bg-[var(--accent)]/20 px-2 py-0.5 text-[9px] font-medium text-[var(--accent)]">
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-1">
                    {t.requestType.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">
                    {t.messageBody}
                  </p>
                  {t.incentive && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-[10px] text-[var(--success-green)] font-medium">🎁 {t.incentive}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => openEdit(t)}
                    className="rounded px-3 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors"
                  >
Modifier
                    
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="rounded px-3 py-1 text-xs text-[var(--risk-red)] hover:bg-[var(--kpi-red-bg)] transition-colors"
                  >
Supprimer
                    
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-[var(--bg-surface)] p-4">
        <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Variables du modèle
        </p>
        <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
          <li>• <code className="text-[var(--accent)]">{`{{buyerName}}`}</code> — Nom de l&apos;acheteur (ex: Mohamed)</li>
          <li>• <code className="text-[var(--accent)]">{`{{product}}`}</code> — Nom du produit (ex: TV Samsung 55&quot;)</li>
          <li>• <code className="text-[var(--accent)]">{`{{orderAmount}}`}</code> — Montant de la commande (ex: 1200)</li>
          <li>• <code className="text-[var(--accent)]">{`{{incentive}}`}</code> — Valeur de l&apos;incitation de ce modèle</li>
        </ul>
      </div>
    </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        titleKey="confirm.delete.title"
        descKey="confirm.delete.desc"
        confirmKey="cta.remove"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

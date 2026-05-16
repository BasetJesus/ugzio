"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

export interface DeliveryProviderSummary {
  id: string;
  name: string;
  rtsCostPerFailure: number;
  avgDeliveryDays: number;
  contactSuccessRate: number | null;
  isDefault: boolean;
  orderCount: number;
  createdAt: string;
}

type View = "list" | "create" | "edit";

export default function DeliverySettingsClient() {
  const router = useRouter();
  const [view, setView] = useState<View>("list");
  const [providers, setProviders] = useState<DeliveryProviderSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formRtsCost, setFormRtsCost] = useState("15");
  const [formDeliveryDays, setFormDeliveryDays] = useState("3");
  const [formSuccessRate, setFormSuccessRate] = useState("");
  const [formIsDefault, setFormIsDefault] = useState(false);

  async function loadProviders() {
    try {
      const res = await fetch("/api/v1/settings/delivery");
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch {
      setError("Échec du chargement des transporteurs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProviders();
  }, []);

  function openCreate() {
    setFormName("");
    setFormRtsCost("15");
    setFormDeliveryDays("3");
    setFormSuccessRate("");
    setFormIsDefault(providers.length === 0);
    setError("");
    setView("create");
  }

  function openEdit(provider: DeliveryProviderSummary) {
    setSelectedId(provider.id);
    setFormName(provider.name);
    setFormRtsCost(String(provider.rtsCostPerFailure));
    setFormDeliveryDays(String(provider.avgDeliveryDays));
    setFormSuccessRate(provider.contactSuccessRate ? String(provider.contactSuccessRate) : "");
    setFormIsDefault(provider.isDefault);
    setError("");
    setView("edit");
  }

  async function handleCreate() {
    if (!formName.trim()) {
      setError("Le nom du transporteur est requis");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/v1/settings/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          rtsCostPerFailure: parseFloat(formRtsCost) || 15,
          avgDeliveryDays: parseInt(formDeliveryDays) || 3,
          contactSuccessRate: formSuccessRate ? parseFloat(formSuccessRate) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Échec de création du transporteur");
        return;
      }

      if (formIsDefault && data.id) {
        await fetch(`/api/v1/settings/delivery/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDefault: true }),
        });
      }

      setView("list");
      loadProviders();
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!selectedId || !formName.trim()) {
      setError("Le nom du transporteur est requis");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/settings/delivery/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          rtsCostPerFailure: parseFloat(formRtsCost) || 15,
          avgDeliveryDays: parseInt(formDeliveryDays) || 3,
          contactSuccessRate: formSuccessRate ? parseFloat(formSuccessRate) : null,
          isDefault: formIsDefault,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Échec de mise à jour du transporteur");
        return;
      }

      setView("list");
      loadProviders();
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
      const res = await fetch(`/api/v1/settings/delivery/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Échec de suppression");
        return;
      }

      loadProviders();
      router.refresh();
    } catch {
      setError("Erreur réseau");
    }
  }

  if (view === "create" || view === "edit") {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {view === "create" ? "Ajouter un transporteur" : "Modifier le transporteur"}
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

        <div className="space-y-4 max-w-[28rem]">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Nom du transporteur *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="ex: Aramex, Poste Tunisienne"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                RTS Cost (TND)
              </label>
              <input
                type="number"
                value={formRtsCost}
                onChange={(e) => setFormRtsCost(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Jours livraison moy.
              </label>
              <input
                type="number"
                value={formDeliveryDays}
                onChange={(e) => setFormDeliveryDays(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Taux de succès contact (%) (optionnel)
            </label>
            <input
              type="number"
              value={formSuccessRate}
              onChange={(e) => setFormSuccessRate(e.target.value)}
              placeholder="ex: 75"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formIsDefault}
              onChange={(e) => setFormIsDefault(e.target.checked)}
              className="rounded border-[var(--border)] bg-[var(--bg-surface)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Définir comme transporteur par défaut</span>
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
              {saving ? "Enregistrement..." : view === "create" ? "Créer le transporteur" : "Mettre à jour"}
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
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Transporteurs</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configurez vos coûts de livraison pour des calculs précis du revenu en risque
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          + Ajouter un transporteur
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-4"><LoadingSkeleton variant="list" count={3} /></div>
      ) : providers.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
          <div className="text-4xl mb-3 text-[var(--text-tertiary)]">◇</div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Aucun transporteur configuré</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Ajoutez vos transporteurs pour calculer les coûts RTS précis
          </p>
          <button
            onClick={openCreate}
            className="mt-4 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Ajouter votre premier transporteur
          </button>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Valeurs par défaut : 15 TND coût RTS, 3 jours livraison
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-4 transition-colors ${
                p.isDefault
                  ? "border-[var(--accent)]/50 bg-[var(--accent)]/5"
                  : "border-[var(--border)] bg-[var(--bg-card)]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</h3>
                    {p.isDefault && (
                      <span className="rounded-full bg-[var(--accent)]/20 px-2 py-0.5 text-[9px] font-medium text-[var(--accent)]">
Défaut
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Coût RTS</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{p.rtsCostPerFailure} TND</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Livraison</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{p.avgDeliveryDays} jours</p>
                    </div>
                    {p.contactSuccessRate !== null && (
                      <div>
                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Taux succès</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{p.contactSuccessRate}%</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Commandes liées</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{p.orderCount}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded px-3 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors"
                  >
Modifier
                  </button>
                  {p.orderCount === 0 && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded px-3 py-1 text-xs text-[var(--risk-red)] hover:bg-[var(--kpi-red-bg)] transition-colors"
                    >
Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-[var(--bg-surface)] p-4">
        <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Comment c'est utilisé
        </p>
        <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
          <li>• Coût RTS = montant perdu par retour (transport + emballage)</li>
          <li>• Utilisé pour calculer les &ldquo;pertes évitées&rdquo; quand vous annulez des commandes risquées</li>
          <li>• Utilisé avec le score de risque pour calculer le &ldquo;revenu en risque&rdquo; de chaque commande</li>
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

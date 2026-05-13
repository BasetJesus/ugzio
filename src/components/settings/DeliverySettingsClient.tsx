"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  const [formName, setFormName] = useState("");
  const [formRtsCost, setFormRtsCost] = useState("15");
  const [formDeliveryDays, setFormDeliveryDays] = useState("3");
  const [formSuccessRate, setFormSuccessRate] = useState("");
  const [formIsDefault, setFormIsDefault] = useState(false);

  async function loadProviders() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/settings/delivery");
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch {
      setError("Failed to load providers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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
      setError("Provider name is required");
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
        setError(data.error || "Failed to create provider");
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
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!selectedId || !formName.trim()) {
      setError("Provider name is required");
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
        setError(data.error || "Failed to update provider");
        return;
      }

      setView("list");
      loadProviders();
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this delivery provider?")) return;

    try {
      const res = await fetch(`/api/v1/settings/delivery/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete");
        return;
      }

      loadProviders();
      router.refresh();
    } catch {
      setError("Network error");
    }
  }

  if (view === "create" || view === "edit") {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {view === "create" ? "Add Delivery Provider" : "Edit Provider"}
          </h2>
          <button
            onClick={() => setView("list")}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
            {error}
          </div>
        )}

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Provider Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Aramex, Poste Tunisienne"
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
                Avg Delivery Days
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
              Contact Success Rate (%) (optional)
            </label>
            <input
              type="number"
              value={formSuccessRate}
              onChange={(e) => setFormSuccessRate(e.target.value)}
              placeholder="e.g., 75"
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
            <span className="text-sm text-[var(--text-secondary)]">Set as default provider</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setView("list")}
              className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={view === "create" ? handleCreate : handleUpdate}
              disabled={saving}
              className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : view === "create" ? "Create Provider" : "Update"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Delivery Providers</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure your delivery economics for accurate revenue at risk calculations
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          + Add Provider
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
          <div className="animate-pulse text-xl text-[var(--text-tertiary)]">◎</div>
          <p className="text-sm text-[var(--text-tertiary)] mt-2">Loading...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
          <div className="text-4xl mb-3 text-[var(--text-tertiary)]">◇</div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No delivery providers configured</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Add your delivery providers to calculate accurate RTS costs
          </p>
          <button
            onClick={openCreate}
            className="mt-4 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Add Your First Provider
          </button>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Using default: 15 TND RTS cost, 3 day delivery
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
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">RTS Cost</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{p.rtsCostPerFailure} TND</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Delivery</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{p.avgDeliveryDays} days</p>
                    </div>
                    {p.contactSuccessRate !== null && (
                      <div>
                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Success Rate</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{p.contactSuccessRate}%</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Linked Orders</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{p.orderCount}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded px-3 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors"
                  >
                    Edit
                  </button>
                  {p.orderCount === 0 && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded px-3 py-1 text-xs text-[var(--risk-red)] hover:bg-[var(--kpi-red-bg)] transition-colors"
                    >
                      Delete
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
          How this is used
        </p>
        <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
          <li>• RTS Cost = amount you lose per return-to-sender (shipping + packaging)</li>
          <li>• Used to calculate &ldquo;estimated loss prevented&rdquo; when you cancel risky orders</li>
          <li>• Used with risk score to calculate &ldquo;revenue at risk&rdquo; for each order</li>
        </ul>
      </div>
    </div>
  );
}

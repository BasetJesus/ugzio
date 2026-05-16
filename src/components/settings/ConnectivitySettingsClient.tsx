"use client";

import { useState, useEffect, useCallback } from "react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface ConnectionState {
  status: "connected" | "disconnected" | "pending" | "expired"
  phoneNumber?: string
  phoneNumberId?: string
  hasAccessToken?: boolean
  connectedAt?: string
  expiresAt?: string
}

export default function ConnectivitySettingsClient() {
  const [connection, setConnection] = useState<ConnectionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/whatsapp/connection");
      if (res.ok) {
        const data: ConnectionState = await res.json();
        setConnection(data);
        setPhoneNumber(data.phoneNumber || "");
        setPhoneNumberId(data.phoneNumberId || "");
      }
    } catch { setError("Échec du chargement"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/v1/whatsapp/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: phoneNumber || phoneNumberId || accessToken ? "connected" : "disconnected",
          phoneNumber: phoneNumber.trim() || undefined,
          phoneNumberId: phoneNumberId.trim() || undefined,
          accessToken: accessToken.trim() || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur"); return; }
      setSuccess(true);
      await load();
      setAccessToken("");
    } catch { setError("Erreur réseau"); }
    finally { setSaving(false); }
  }

  async function handleDisconnect() {
    setSaving(true);
    try {
      await fetch("/api/v1/whatsapp/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "disconnected" }),
      });
      await load();
    } catch { setError("Erreur"); }
    finally { setSaving(false); }
  }

  const isConnected = connection?.status === "connected";

  if (loading) {
    return <div className="p-4"><LoadingSkeleton variant="card" count={1} /></div>;
  }

  return (
    <div className="space-y-6">
      {isConnected && (
        <div className="rounded-xl border border-[var(--success-green)]/30 bg-[var(--success-green-bg)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--success-green)]">WhatsApp connecté</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {connection?.phoneNumber && `Numéro : ${connection.phoneNumber}`}
                {connection?.connectedAt && ` · connecté depuis ${new Date(connection.connectedAt).toLocaleDateString()}`}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={saving}
              className="rounded-lg border border-[var(--risk-red)]/30 px-3 py-1.5 text-xs font-medium text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] transition-colors"
            >
              Déconnecter
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Configuration WhatsApp</h3>
        <p className="text-xs text-[var(--text-tertiary)]">
          Renseigne les informations de ton compte WhatsApp Business API (Meta).
          Tu dois avoir un compte WhatsApp Business App configuré sur le portail Meta Developers.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Numéro WhatsApp</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+216 XX XXX XXX"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Phone Number ID</label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="123456789"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Token d&apos;accès</label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAA..." 
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
            />
            {connection?.hasAccessToken && (
              <p className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                Un token est déjà enregistré. Laisse vide pour conserver l&apos;existant.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent)]/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>

        {error && <p className="text-xs text-[var(--risk-red)]">{error}</p>}
        {success && <p className="text-xs text-[var(--success-green)]">Configuration enregistrée ✓</p>}
      </div>
    </div>
  );
}

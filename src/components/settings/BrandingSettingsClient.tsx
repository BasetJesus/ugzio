"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import SocialConnectButton from "./SocialConnectButton";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface SocialLinks {
  instagram?: string
  facebook?: string
  tiktok?: string
}

interface SellerProfile {
  brandDescription: string | null
  sellerPhone: string | null
  socialLinks: SocialLinks
}

interface ConnectedAccount {
  id: string
  platform: string
  accountName: string | null
  accountPicture: string | null
  followersCount: number | null
  connectedAt: string | null
}

export default function BrandingSettingsClient() {
  const [, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [brandDescription, setBrandDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");

  const [connections, setConnections] = useState<ConnectedAccount[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/seller-profile");
      if (res.ok) {
        const data: SellerProfile = await res.json();
        setProfile(data);
        setBrandDescription(data.brandDescription || "");
        setInstagram(data.socialLinks?.instagram || "");
        setFacebook(data.socialLinks?.facebook || "");
        setTiktok(data.socialLinks?.tiktok || "");
      }
    } catch { setError("Échec du chargement"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function loadConnections() {
    try {
      const res = await fetch("/api/v1/social-connections");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch {}
    finally { setConnectionsLoading(false); }
  }

  useEffect(() => { loadConnections(); }, []);

  const getConnection = (platform: string) => connections.find((c) => c.platform === platform) ?? null;

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/v1/seller-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandDescription: brandDescription.trim() || undefined,
          socialLinks: {
            ...(instagram.trim() && { instagram: instagram.trim() }),
            ...(facebook.trim() && { facebook: facebook.trim() }),
            ...(tiktok.trim() && { tiktok: tiktok.trim() }),
          },
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur"); return; }
      setSuccess(true);
      await load();
    } catch { setError("Erreur réseau"); }
    finally { setSaving(false); }
  }

  if (loading) {
    return <div className="p-4"><LoadingSkeleton variant="card" count={1} /></div>;
  }

  const charCount = brandDescription.length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Description de la marque</h3>
        <p className="text-xs text-[var(--text-tertiary)]">
          Cette description apparaît sur la page de suivi de commande de tes acheteurs (magic link).
        </p>
        <div>
          <textarea
            value={brandDescription}
            onChange={(e) => setBrandDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Décris ta marque en quelques phrases..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50 resize-none"
          />
          <p className={`mt-1 text-[10px] text-right ${charCount > 450 ? "text-[var(--warning-amber)]" : "text-[var(--text-tertiary)]"}`}>
            {charCount}/500
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Réseaux sociaux</h3>
        <p className="text-xs text-[var(--text-tertiary)]">
          Liens visibles sur la page magic link de tes acheteurs.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Instagram</label>
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/toncompte"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Facebook</label>
            <input
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/toncompte"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">TikTok</label>
            <input
              type="url"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="https://tiktok.com/@toncompte"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Connexions sociales</h3>
        <p className="text-xs text-[var(--text-tertiary)]">
          Connecte tes réseaux sociaux en un clic pour afficher ta preuve sociale sur le magic link.
        </p>
        {connectionsLoading ? (
          <div className="text-xs text-[var(--text-tertiary)] py-2">Chargement...</div>
        ) : (
          <div className="space-y-3">
            <SocialConnectButton
              platform="instagram"
              label="Instagram"
              icon="📸"
              color="#E4405F"
              connection={getConnection("instagram")}
              onDisconnect={() => loadConnections()}
            />
            <SocialConnectButton
              platform="facebook"
              label="Facebook"
              icon="👍"
              color="#1877F2"
              connection={getConnection("facebook")}
              onDisconnect={() => loadConnections()}
            />
            <SocialConnectButton
              platform="tiktok"
              label="TikTok"
              icon="🎵"
              color="#000000"
              connection={getConnection("tiktok")}
              onDisconnect={() => loadConnections()}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent)]/90 disabled:opacity-50 transition-colors"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>

      {error && <p className="text-xs text-[var(--risk-red)]">{error}</p>}
      {success && <p className="text-xs text-[var(--success-green)]">Modifications enregistrées ✓</p>}
    </div>
  );
}


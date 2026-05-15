"use client";

import { useState } from "react";

interface ConnectedAccount {
  id: string
  accountName: string | null
  accountPicture: string | null
  followersCount: number | null
  connectedAt: string | null
}

interface Props {
  platform: string
  label: string
  icon: string
  color: string
  connection: ConnectedAccount | null
  onDisconnect: () => void
}

export default function SocialConnectButton({ platform, label, icon, color, connection, onDisconnect }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/social-connections/${platform}`, { method: "POST" });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError(data.error || "Erreur de connexion");
      }
    } catch {
      setError("Erreur réseau");
    }
    setLoading(false);
  }

  async function handleDisconnect() {
    setLoading(true);
    try {
      await fetch(`/api/v1/social-connections/${platform}`, { method: "DELETE" });
      onDisconnect();
    } catch {
      setError("Erreur");
    }
    setLoading(false);
  }

  if (connection) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="flex items-center gap-3">
          {connection.accountPicture ? (
            <img src={connection.accountPicture} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
              <span className="text-lg">{icon}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{connection.accountName ?? label}</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {connection.followersCount != null && `${connection.followersCount.toLocaleString()} abonnés · `}
              {connection.connectedAt && `Connecté ${new Date(connection.connectedAt).toLocaleDateString()}`}
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="rounded-lg border border-[var(--risk-red)]/30 px-3 py-1.5 text-[10px] font-medium text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] disabled:opacity-50 transition-colors shrink-0"
          >
            {loading ? "..." : "Retirer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${color}15` }}>
          <span className="text-lg">{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">
            {platform === "instagram" && "Photos, stories, abonnés"}
            {platform === "facebook" && "Page, avis, audience"}
            {platform === "tiktok" && "Vidéos, engagement, tendances"}
          </p>
        </div>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="rounded-lg px-3 py-1.5 text-[10px] font-semibold text-white disabled:opacity-50 transition-colors shrink-0"
          style={{ backgroundColor: color }}
        >
          {loading ? "..." : "Connecter"}
        </button>
      </div>
      {error && <p className="mt-2 text-[10px] text-[var(--risk-red)]">{error}</p>}
    </div>
  );
}

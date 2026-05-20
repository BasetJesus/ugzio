"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { Shield, Users, AlertTriangle } from "lucide-react";

interface BlacklistEntry {
  phone: string;
  reason?: string;
  createdAt: string;
}

interface ZioGuardStats {
  totalEntries: number;
  multiFlagged: number;
  recentFlags: { phoneHash: string; flagCount: number; lastFlagged: string }[];
  yourContributions: number;
}

export default function BlacklistClient() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [guardStats, setGuardStats] = useState<ZioGuardStats | null>(null);

  const load = useCallback(async () => {
    try {
      const [blRes, guardRes] = await Promise.all([
        fetch("/api/v1/zioshield/blacklist"),
        fetch("/api/v1/zioguard"),
      ]);
      if (blRes.ok) setEntries(await blRes.json());
      if (guardRes.ok) setGuardStats(await guardRes.json());
    } catch {
      setError("Échec du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!phone.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/v1/zioshield/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), reason: reason.trim() || undefined }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur"); return; }
      setPhone("");
      setReason("");
      await load();
    } catch { setError("Erreur réseau"); }
    finally { setAdding(false); }
  }

  async function handleRemove(phone: string) {
    try {
      await fetch("/api/v1/zioshield/blacklist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      await load();
    } catch { setError("Erreur"); }
  }

  return (
    <div className="space-y-6">
      {guardStats && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-space">ZioGuard Network</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider font-space">Shared Flags</p>
              <p className="text-lg font-bold text-[var(--text-primary)] font-space">{guardStats.totalEntries}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider font-space">Multi-Seller</p>
              <p className="text-lg font-bold text-[var(--status-danger)] font-space">{guardStats.multiFlagged}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider font-space">Your Flags</p>
              <p className="text-lg font-bold text-[var(--accent)] font-space">{guardStats.yourContributions}</p>
            </div>
          </div>
          {guardStats.multiFlagged > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--status-warning)] font-inter">
              <AlertTriangle className="h-3 w-3" />
              {guardStats.multiFlagged} phone{guardStats.multiFlagged > 1 ? "s" : ""} flagged by multiple sellers
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Ajouter un numéro</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("bl.phone-placeholder")}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
          />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("bl.reason-placeholder")}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !phone.trim()}
            className="rounded-lg bg-[var(--risk-red)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--risk-red)]/90 disabled:opacity-50 transition-colors shrink-0"
          >
            {adding ? "..." : t("bl.add")}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-[var(--risk-red)]">{error}</p>}
      </div>

      {loading ? (
        <div className="p-4"><LoadingSkeleton variant="list" count={3} /></div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">{t("bl.empty")}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)]">
          {entries.map((entry) => (
            <div key={entry.phone} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{entry.phone}</p>
                {entry.reason && <p className="text-xs text-[var(--text-tertiary)]">{entry.reason}</p>}
              </div>
              <button
                onClick={() => handleRemove(entry.phone)}
                className="rounded-lg border border-[var(--risk-red)]/30 px-3 py-1.5 text-xs font-medium text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] transition-colors shrink-0"
              >
                {t("bl.remove")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

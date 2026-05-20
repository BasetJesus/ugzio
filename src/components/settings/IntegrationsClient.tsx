"use client";

import { useState, useEffect, useCallback } from "react";
import { Globe, ShoppingCart, Store, Link2, Unlink, Check } from "lucide-react";

interface Integration {
  id: string;
  platform: string;
  label: string | null;
  storeUrl: string | null;
  isActive: boolean;
  lastSyncAt: string | null;
  lastOrderId: string | null;
}

const PLATFORM_INFO: Record<string, { name: string; icon: typeof Globe; color: string; desc: string }> = {
  shopify: { name: "Shopify", icon: ShoppingCart, color: "text-[#96BF48]", desc: "Connect your Shopify store to auto-import orders via webhook." },
  youcan: { name: "YouCan", icon: Store, color: "text-[var(--accent)]", desc: "Import orders from your YouCan.shop store automatically." },
  woocommerce: { name: "WooCommerce", icon: ShoppingCart, color: "text-[#9B5DE0]", desc: "Connect WooCommerce to sync orders via REST API." },
  tiktak: { name: "TikTak Pro", icon: Globe, color: "text-[var(--status-info)]", desc: "Import orders from TikTak Pro delivery platform." },
};

export default function IntegrationsClient() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [formData, setFormData] = useState<Record<string, { label: string; apiKey: string; apiSecret: string; storeUrl: string }>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/integrations");
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleConnect = async (platform: string) => {
    const fd = formData[platform] || { label: "", apiKey: "", apiSecret: "", storeUrl: "" };
    const res = await fetch(`/api/v1/integrations/manage/${platform}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: fd.label || PLATFORM_INFO[platform]?.name,
        apiKey: fd.apiKey || undefined,
        apiSecret: fd.apiSecret || undefined,
        storeUrl: fd.storeUrl || undefined,
      }),
    });
    if (res.ok) {
      await load();
      setExpanded(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    const res = await fetch(`/api/v1/integrations/manage/${platform}`, { method: "DELETE" });
    if (res.ok) await load();
  };

  const existing = new Set(integrations.filter((i) => i.isActive).map((i) => i.platform));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)] font-space flex items-center gap-1.5">
          <Link2 className="h-4 w-4 text-[var(--accent)]" />
          Platform Integrations
        </h3>
        <p className="text-[10px] text-[var(--text-secondary)] font-inter mt-0.5">
          Connect your e-commerce platforms to auto-import orders.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <span className="text-xs text-[var(--text-muted)] font-inter">Loading...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(PLATFORM_INFO).map(([key, info]) => {
            const Icon = info.icon;
            const isConnected = existing.has(key);
            const integration = integrations.find((i) => i.platform === key);
            const isExpanded = expanded === key;
            const fd = formData[key] || { label: "", apiKey: "", apiSecret: "", storeUrl: "" };

            return (
              <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${info.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] font-space">{info.name}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] font-inter truncate">{info.desc}</p>
                  </div>
                  {isConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--status-success)] font-space">
                        <Check className="h-3 w-3" />
                        CONNECTED
                      </span>
                      <button
                        onClick={() => handleDisconnect(key)}
                        className="h-8 w-8 rounded-lg border border-[var(--status-danger)]/30 text-[var(--status-danger)] flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Unlink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpanded(isExpanded ? null : key)}
                      className="h-8 px-3 bg-[var(--accent)] text-[var(--bg-base)] rounded-lg text-[9px] font-bold font-space flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      <Link2 className="h-3 w-3" />
                      CONNECT
                    </button>
                  )}
                </div>

                {integration?.lastSyncAt && (
                  <div className="px-3 pb-2">
                    <p className="text-[8px] text-[var(--text-muted)] font-inter">
                      Last sync: {new Date(integration.lastSyncAt).toLocaleDateString("fr-TN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {integration.lastOrderId ? ` · Last order: #${integration.lastOrderId.slice(-8)}` : ""}
                    </p>
                  </div>
                )}

                {isExpanded && !isConnected && (
                  <div className="border-t border-[var(--border)] p-3 space-y-2">
                    <input
                      type="text"
                      value={fd.label}
                      onChange={(e) => setFormData((p) => ({ ...p, [key]: { ...fd, label: e.target.value } }))}
                      placeholder="Store label (e.g. My Store)"
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg h-9 px-3 text-xs text-[var(--text-primary)] font-inter placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]"
                    />
                    <input
                      type="text"
                      value={fd.apiKey}
                      onChange={(e) => setFormData((p) => ({ ...p, [key]: { ...fd, apiKey: e.target.value } }))}
                      placeholder="API Key / Token"
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg h-9 px-3 text-xs text-[var(--text-primary)] font-inter placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]"
                    />
                    <input
                      type="password"
                      value={fd.apiSecret}
                      onChange={(e) => setFormData((p) => ({ ...p, [key]: { ...fd, apiSecret: e.target.value } }))}
                      placeholder="API Secret (if required)"
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg h-9 px-3 text-xs text-[var(--text-primary)] font-inter placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]"
                    />
                    <input
                      type="text"
                      value={fd.storeUrl}
                      onChange={(e) => setFormData((p) => ({ ...p, [key]: { ...fd, storeUrl: e.target.value } }))}
                      placeholder="Store URL (e.g. mystore.shopify.com)"
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg h-9 px-3 text-xs text-[var(--text-primary)] font-inter placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)]"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleConnect(key)}
                        className="flex-1 h-9 bg-[var(--accent)] text-[var(--bg-base)] rounded-lg text-[10px] font-bold font-space active:scale-95 transition-transform"
                      >
                        SAVE & CONNECT
                      </button>
                      <button
                        onClick={() => setExpanded(null)}
                        className="h-9 px-4 border border-[var(--border)] rounded-lg text-[10px] font-bold text-[var(--text-secondary)] font-space"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {integrations.filter((i) => i.isActive).length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <p className="text-[9px] text-[var(--text-tertiary)] font-inter text-center">
            Orders from connected platforms are automatically imported via webhook.
            Configure webhook URL: <code className="text-[var(--accent)] font-mono text-[8px]">{typeof window !== "undefined" ? window.location.origin : ""}/api/v1/integrations/webhook</code>
          </p>
        </div>
      )}
    </div>
  );
}

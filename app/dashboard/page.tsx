"use client";

import { useState, useRef } from "react";
import CaptionGenerator from "../components/CaptionGenerator";
import { useLanguage } from "../context/LanguageContext";

interface Order {
  id: string;
  buyerPhone: string;
  buyerName: string;
  product: string;
  price: number;
  timestamp: number;
  verified: boolean;
  delivered: boolean;
  ugcRequested: boolean;
}

interface BlacklistEntry {
  phone: string;
  reason: string;
  addedAt: number;
}

type Tab = "new-order" | "orders" | "blacklist" | "captions";
type Risk = "LOW" | "MEDIUM" | "HIGH";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function calcScore(
  phone: string,
  orders: Order[],
  blacklist: BlacklistEntry[],
  excludeId?: string,
): { score: number; risk: Risk } {
  if (blacklist.some((b) => b.phone === phone))
    return { score: 0, risk: "HIGH" };
  const count = orders.filter(
    (o) => o.buyerPhone === phone && o.id !== excludeId,
  ).length;
  if (count === 0) return { score: 60, risk: "MEDIUM" };
  return { score: 85, risk: "LOW" };
}

const META: Record<Risk, { bg: string; text: string; bar: string; labelKey: string }> = {
  LOW: { bg: "bg-green-500/15", text: "text-green-400", bar: "bg-green-500", labelKey: "risk.low-long" },
  MEDIUM: { bg: "bg-orange-500/15", text: "text-orange-400", bar: "bg-orange-500", labelKey: "risk.medium-long" },
  HIGH: { bg: "bg-red-500/15", text: "text-red-400", bar: "bg-red-500", labelKey: "risk.high-long" },
};

const COLORS: Record<Risk, string> = {
  LOW: "#22c55e",
  MEDIUM: "#f97316",
  HIGH: "#ef4444",
};

function Gauge({ score, risk }: { score: number; risk: Risk }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-zinc-800"
        />
        <circle
          cx="16"
          cy="16"
          r={r}
          fill="none"
          stroke={COLORS[risk]}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circ} ${circ}`}
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color: COLORS[risk] }}>
        {score}
      </span>
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${className ?? ""}`}
    />
  );
}

function loadFrom<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const d = localStorage.getItem(key);
    return d ? (JSON.parse(d) as T[]) : [];
  } catch {
    return [];
  }
}

const TAB_IDS: Tab[] = ["new-order", "orders", "blacklist", "captions"];

export default function Dashboard() {
  const { t, lang, setLang } = useLanguage();
  const [tab, setTab] = useState<Tab>("new-order");
  const [orders, setOrders] = useState<Order[]>(() => loadFrom<Order>("ugzio_orders"));
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(() => loadFrom<BlacklistEntry>("ugzio_blacklist"));

  const [sellerName, setSellerName] = useState(() => {
    if (typeof window === "undefined") return "Moncef";
    return localStorage.getItem("ugzio_seller_name") || "Moncef";
  });
  const [editingName, setEditingName] = useState(false);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const [blPhone, setBlPhone] = useState("");
  const [blReason, setBlReason] = useState("");

  const lastVerifiedRef = useRef("");

  function saveSellerName(name: string) {
    setSellerName(name);
    localStorage.setItem("ugzio_seller_name", name);
  }

  function sendWhatsAppVerification(phoneNum: string) {
    const msg = `السلام عليكم، تأكد طلبك مع ${sellerName} - اضغط هنا للتأكيد ✅`;
    console.log(`[WhatsApp] To: ${phoneNum}`);
    console.log(`[WhatsApp] Message: ${msg}`);
    setVerificationSent(true);
  }

  function handlePhoneChange(value: string) {
    setPhone(value);
    const trimmed = value.trim();
    if (trimmed.length >= 8 && trimmed !== lastVerifiedRef.current) {
      lastVerifiedRef.current = trimmed;
      sendWhatsAppVerification(trimmed);
    }
  }

  function saveOrders(o: Order[]) {
    setOrders(o);
    localStorage.setItem("ugzio_orders", JSON.stringify(o));
  }

  function saveBlacklist(b: BlacklistEntry[]) {
    setBlacklist(b);
    localStorage.setItem("ugzio_blacklist", JSON.stringify(b));
  }

  function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (!phone.trim() || !name.trim() || !product.trim() || !price.trim()) {
      setFormError(t("order.error.required"));
      return;
    }
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) {
      setFormError(t("order.error.price"));
      return;
    }
    if (blacklist.some((b) => b.phone === phone.trim())) {
      const ok = window.confirm(t("order.error.blacklist"));
      if (!ok) return;
    }

    saveOrders([
      {
        id: uid(),
        buyerPhone: phone.trim(),
        buyerName: name.trim(),
        product: product.trim(),
        price: p,
        timestamp: Date.now(),
        verified: verificationSent,
        delivered: false,
        ugcRequested: false,
      },
      ...orders,
    ]);
    setSuccess(`${t("order.success")} ${name}`);
    setTimeout(() => setSuccess(""), 4000);
    setPhone("");
    setName("");
    setProduct("");
    setPrice("");
    setVerificationSent(false);
    lastVerifiedRef.current = "";
  }

  function handleBlacklist(e: React.FormEvent) {
    e.preventDefault();
    const p = blPhone.trim();
    if (!p) return;
    if (!blacklist.some((b) => b.phone === p)) {
      saveBlacklist([
        ...blacklist,
        { phone: p, reason: blReason.trim(), addedAt: Date.now() },
      ]);
    }
    setBlPhone("");
    setBlReason("");
  }

  function removeBlacklist(phone: string) {
    saveBlacklist(blacklist.filter((b) => b.phone !== phone));
  }

  function markDelivered(id: string) {
    saveOrders(orders.map((o) => (o.id === id ? { ...o, delivered: true } : o)));
  }

  function requestUgc(order: Order) {
    const msg = `شكراً على طلبك! تحب تشارك تجربتك؟ أرسل صورة أو فيديو للمنتج وتربح كود تخفيض 🎁`;
    console.log(`[WhatsApp UGC] To: ${order.buyerPhone}`);
    console.log(`[WhatsApp UGC] Message: ${msg}`);
    saveOrders(orders.map((o) => (o.id === order.id ? { ...o, ugcRequested: true } : o)));
  }

  const trust = phone.trim() ? calcScore(phone.trim(), orders, blacklist) : null;
  const meta = trust ? META[trust.risk] : null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayOrders = orders.filter((o) => o.timestamp >= todayStart);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.price, 0);
  const highRiskCount = orders.filter((o) => calcScore(o.buyerPhone, orders, blacklist).score < 40).length;
  const verifiedCount = orders.filter((o) => o.verified).length;
  const verificationRate = orders.length > 0 ? Math.round((verifiedCount / orders.length) * 100) : 0;

  const cards = [
    { labelKey: "kpi.orders-today", value: todayOrders.length, color: "text-purple-400", icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" },
    { labelKey: "kpi.revenue-today", value: `${todayRevenue.toFixed(3)} TND`, color: "text-emerald-400", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { labelKey: "kpi.high-risk", value: highRiskCount, color: highRiskCount > 0 ? "text-red-400" : "text-zinc-500", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
    { labelKey: "kpi.verification-rate", value: `${verificationRate}%`, color: "text-sky-400", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="relative mb-8 text-center">
        <div className="absolute right-0 top-0 flex gap-1">
          <button
            onClick={() => setLang("ar")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              lang === "ar"
                ? "bg-purple-600/20 text-purple-300"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => setLang("fr")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              lang === "fr"
                ? "bg-purple-600/20 text-purple-300"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Français
          </button>
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            UGZIO
          </span>
        </h1>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.labelKey}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700"
          >
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
              </svg>
              <span className="text-xs font-medium text-zinc-500">{t(c.labelKey)}</span>
            </div>
            <p className={`text-xl font-bold tracking-tight ${c.color}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-8 flex justify-center gap-2">
        {TAB_IDS.map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              tab === id
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            {t(`tab.${id}`)}
          </button>
        ))}
      </div>

      {tab === "new-order" && (
        <div className="space-y-6">
          <form
            onSubmit={handleOrder}
            className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <h2 className="text-lg font-semibold text-zinc-200">
              {t("order.title")}
            </h2>

            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-2.5">
              <span className="text-xs font-medium text-zinc-500">
                {t("order.merchant")}
              </span>
              {editingName ? (
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => saveSellerName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-200 outline-none focus:border-purple-500"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="group flex items-center gap-1 text-sm font-medium text-zinc-200 transition hover:text-purple-400"
                >
                  {sellerName}
                  <svg className="h-3.5 w-3.5 text-zinc-600 transition group-hover:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                {t("order.buyer-phone")}
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder={t("order.phone-placeholder")}
              />
              {phone.trim().length >= 8 && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {t("order.verification-sent")} {phone.trim()}
                </p>
              )}
            </div>

            {trust && meta && (
              <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                <Gauge score={trust.score} risk={trust.risk} />
                <div>
                  <p className={`text-sm font-semibold ${meta.text}`}>
                    {t(meta.labelKey)}
                  </p>
                  <p className="text-xs text-zinc-500">{t("risk.buyer-score")}</p>
                  {trust.risk === "HIGH" && (
                    <p className="mt-1 text-xs font-semibold text-red-400">
                      {t("risk.blacklisted-warn")}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  {t("order.buyer-name")}
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("order.name-placeholder")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  {t("order.price")}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.000"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                {t("order.product")}
              </label>
              <Input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder={t("order.product-placeholder")}
              />
            </div>

            {formError && (
              <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {formError}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
            >
              {t("order.place")}
            </button>
          </form>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
              <p className="text-zinc-500">{t("orders.empty")}</p>
            </div>
          ) : (
            orders.map((order) => {
              const s = calcScore(order.buyerPhone, orders, blacklist, order.id);
              const m = META[s.risk];
              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="truncate font-semibold text-zinc-200">
                        {order.buyerName}
                      </p>
                      <p className="truncate text-sm text-zinc-400">
                        {order.buyerPhone}
                      </p>
                      <p className="text-sm text-zinc-300">
                        {order.product}
                      </p>
                      <p className="text-sm font-medium text-purple-300">
                        {order.price.toFixed(3)} TND
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {order.ugcRequested && (
                        <span className="rounded-full bg-pink-500/15 px-2.5 py-0.5 text-xs font-medium text-pink-400">
                          {t("orders.ugc-requested")}
                        </span>
                      )}
                      {!order.ugcRequested && order.delivered && (
                        <button
                          onClick={() => requestUgc(order)}
                          className="rounded-full bg-pink-600/20 px-2.5 py-0.5 text-xs font-medium text-pink-400 transition hover:bg-pink-600/40"
                        >
                          {t("orders.request-ugc")}
                        </button>
                      )}
                      {order.delivered && (
                        <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                          {t("orders.delivered")}
                        </span>
                      )}
                      {!order.delivered && order.verified && (
                        <button
                          onClick={() => markDelivered(order.id)}
                          className="rounded-full bg-blue-600/20 px-2.5 py-0.5 text-xs font-medium text-blue-400 transition hover:bg-blue-600/40"
                        >
                          {t("orders.mark-delivered")}
                        </button>
                      )}
                      {order.verified && (
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          {t("orders.verified")}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`hidden h-2 w-2 rounded-full sm:block ${
                            s.risk === "LOW"
                              ? "bg-green-500"
                              : s.risk === "MEDIUM"
                                ? "bg-orange-500"
                                : "bg-red-500"
                          }`}
                        />
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${m.bg} ${m.text}`}
                        >
                          {s.score}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-600">
                    {new Date(order.timestamp).toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "blacklist" && (
        <div className="space-y-6">
          <form onSubmit={handleBlacklist} className="flex flex-wrap gap-3">
            <Input
              type="tel"
              value={blPhone}
              onChange={(e) => setBlPhone(e.target.value)}
              placeholder={t("bl.phone-placeholder")}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <Input
              type="text"
              value={blReason}
              onChange={(e) => setBlReason(e.target.value)}
              placeholder={t("bl.reason-placeholder")}
              className="min-w-[140px] flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500"
            >
              {t("bl.add")}
            </button>
          </form>

          {blacklist.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
              <p className="text-zinc-500">{t("bl.empty")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blacklist.map((entry) => (
                <div
                  key={entry.phone}
                  className="flex items-center justify-between gap-3 rounded-xl border border-red-900/30 bg-red-950/20 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-200">
                      {entry.phone}
                    </p>
                    {entry.reason && (
                      <p className="truncate text-sm text-zinc-400">
                        {entry.reason}
                      </p>
                    )}
                    <p className="text-xs text-zinc-600">
                      {new Date(entry.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeBlacklist(entry.phone)}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-800 hover:text-red-400"
                  >
                    {t("bl.remove")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "captions" && <CaptionGenerator />}
    </div>
  );
}

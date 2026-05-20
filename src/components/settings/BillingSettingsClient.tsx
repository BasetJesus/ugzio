"use client";

import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  maxOrdersPerMonth: number;
  hasZioConfirm: boolean;
  hasZioBrain: boolean;
  hasZioConnect: boolean;
  hasZioFlow: boolean;
  hasZioNetwork: boolean;
  aiInsightsPerMonth: number;
  verificationsPerMonth: number;
}

interface Subscription {
  id: string;
  status: string;
  planName: string;
  planPrice: number;
  currency: string;
  maxOrdersPerMonth: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
}

interface Usage {
  ordersProcessed: number;
  ordersLimit: number;
  verificationsSent: number;
  verificationsLimit: number;
  aiInsightsGenerated: number;
  aiInsightsLimit: number;
}

interface Props {
  orgId: string;
  subscription: Subscription | null;
  usage: Usage | null;
  plans: Plan[];
}

const PLAN_LABELS: Record<string, { ar: string; en: string; fr: string }> = {
  free: { ar: "ZioStart", fr: "ZioStart", en: "ZioStart" },
  ziogrow: { ar: "ZioGrow", fr: "ZioGrow", en: "ZioGrow" },
  ziopro: { ar: "ZioPro", fr: "ZioPro", en: "ZioPro" },
  ziomax: { ar: "ZioMax", fr: "ZioMax", en: "ZioMax" },
};

const STATUS_LABELS: Record<string, { ar: string; en: string; fr: string }> = {
  active: { ar: "نشط", fr: "Active", en: "Active" },
  past_due: { ar: "متأخر", fr: "En retard", en: "Past Due" },
  canceled: { ar: "ملغى", fr: "Annulé", en: "Canceled" },
};

export default function BillingSettingsClient({ subscription, usage, plans }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentPlan = subscription?.planName ?? "free";
  const status = subscription?.status ?? "active";
  const isFree = currentPlan === "free";
  const isCanceled = status === "canceled";

  async function handleCheckout(planName: string) {
    setLoading(planName);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "فشلت العملية");
        return;
      }
      window.open(data.payUrl, "_blank");
      setSuccess(`تم تحويلك إلى صفحة الدفع لـ ${PLAN_LABELS[planName]?.ar ?? planName}`);
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    if (!confirm("هل أنت متأكد من إلغاء الاشتراك؟ ستبقى خطتك الحالية حتى نهاية الفترة.")) return;
    setLoading("cancel");
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/v1/billing/cancel", { method: "POST" });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "فشل الإلغاء");
        return;
      }
      setSuccess("تم إلغاء الاشتراك");
      window.location.reload();
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(null);
    }
  }

  const usagePercent = usage && usage.ordersLimit > 0
    ? Math.round((usage.ordersProcessed / usage.ordersLimit) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">الخطة الحالية</p>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
              {PLAN_LABELS[currentPlan]?.ar ?? currentPlan}
            </h2>
            {subscription && (
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {subscription.planPrice} {subscription.currency} / الشهر
              </p>
            )}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            isCanceled
              ? "bg-red-500/10 text-red-400"
              : isFree
                ? "bg-yellow-500/10 text-yellow-400"
                : "bg-green-500/10 text-green-400"
          }`}>
            {isCanceled ? STATUS_LABELS.canceled.ar : isFree ? "مجاني" : STATUS_LABELS.active.ar}
          </span>
        </div>

        {subscription?.currentPeriodEnd && !isFree && (
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            {isCanceled ? "ينتهي في" : "يجدد في"}:{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString("ar-TN")}
          </p>
        )}
      </div>

      {/* Usage Meter */}
      {usage && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <p className="text-xs text-[var(--text-tertiary)] mb-2">استخدام الطلبات هذا الشهر</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent >= 80 ? "bg-red-500" : usagePercent >= 50 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)] shrink-0">
              {usage.ordersProcessed}/{usage.ordersLimit}
            </span>
          </div>
          <div className="mt-2 flex gap-4 text-[10px] text-[var(--text-tertiary)]">
            <span>التحقق: {usage.verificationsSent}/{usage.verificationsLimit}</span>
            <span>AI: {usage.aiInsightsGenerated}/{usage.aiInsightsLimit}</span>
          </div>
        </div>
      )}

      {/* Change Plan */}
      {!isCanceled && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <p className="text-xs text-[var(--text-tertiary)] mb-3">تغيير الخطة</p>
          <div className="space-y-2">
            {plans
              .filter((p) => p.name !== currentPlan && p.name !== "free")
              .map((plan) => (
                <button
                  key={plan.name}
                  onClick={() => handleCheckout(plan.name)}
                  disabled={loading === plan.name}
                  className="w-full flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm hover:border-[var(--accent)]/50 transition-colors disabled:opacity-50"
                >
                  <div className="text-right">
                    <span className="font-medium text-[var(--text-primary)]">
                      {PLAN_LABELS[plan.name]?.ar ?? plan.name}
                    </span>
                    <span className="block text-[10px] text-[var(--text-tertiary)]">
                      {plan.price} {plan.currency}/شهر — {plan.maxOrdersPerMonth === 99999 ? "غير محدود" : `${plan.maxOrdersPerMonth} طلب`}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--accent)]">
                    {loading === plan.name ? "جاري..." : "اشتراك"}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Cancel Subscription */}
      {!isFree && !isCanceled && (
        <button
          onClick={handleCancel}
          disabled={loading === "cancel"}
          className="w-full rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          {loading === "cancel" ? "جاري..." : "إلغاء الاشتراك"}
        </button>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-500/10 p-3 text-xs text-green-400">{success}</div>
      )}
    </div>
  );
}

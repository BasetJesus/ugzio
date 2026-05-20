"use client"

import { useState } from "react"
import { useLanguage } from "@/context/LanguageContext"

interface Props {
  orgId: string
}

export default function SecurityClient({ orgId }: Props) {
  const { t, lang } = useLanguage()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [twoFactor, setTwoFactor] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const passwordStrength = newPassword.length > 0
    ? newPassword.length < 6 ? "weak"
    : newPassword.length < 10 ? "medium"
    : "strong"
    : null

  const sections = [
    {
      id: "password",
      icon: "🔑",
      title: "Sécurité du mot de passe",
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">
              {lang === "ar" ? "كلمة المرور الحالية" : lang === "fr" ? "Mot de passe actuel" : "Current password"}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] min-h-[44px]"
              placeholder={lang === "ar" ? "••••••••" : "••••••••"}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">
              {lang === "ar" ? "كلمة المرور الجديدة" : lang === "fr" ? "Nouveau mot de passe" : "New password"}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] min-h-[44px]"
              placeholder={lang === "ar" ? "••••••••" : "••••••••"}
            />
            {passwordStrength && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      passwordStrength === "weak" ? "w-1/3 bg-[var(--status-danger)]" :
                      passwordStrength === "medium" ? "w-2/3 bg-[var(--status-warning)]" :
                      "w-full bg-[var(--status-success)]"
                    }`}
                  />
                </div>
                <span className={`text-[10px] ${
                  passwordStrength === "weak" ? "text-[var(--status-danger)]" :
                  passwordStrength === "medium" ? "text-[var(--status-warning)]" :
                  "text-[var(--status-success)]"
                }`}>
                  {passwordStrength === "weak" ? (lang === "ar" ? "ضعيف" : lang === "fr" ? "Faible" : "Weak") :
                   passwordStrength === "medium" ? (lang === "ar" ? "متوسط" : lang === "fr" ? "Moyen" : "Medium") :
                   (lang === "ar" ? "قوي" : lang === "fr" ? "Fort" : "Strong")}
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">
              {lang === "ar" ? "تأكيد كلمة المرور الجديدة" : lang === "fr" ? "Confirmer le nouveau mot de passe" : "Confirm new password"}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] min-h-[44px]"
              placeholder={lang === "ar" ? "••••••••" : "••••••••"}
            />
          </div>
          <button className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] active:scale-[0.98] min-h-[44px]">
            {lang === "ar" ? "تحديث كلمة المرور" : lang === "fr" ? "Mettre à jour" : "Update password"}
          </button>
        </div>
      ),
    },
    {
      id: "2fa",
      icon: "🔐",
      title: "Authentification à deux facteurs",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-primary)]">
              {lang === "ar" ? "تفعيل المصادقة الثنائية" : lang === "fr" ? "Activer l'authentification à deux facteurs" : "Enable two-factor authentication"}
            </p>
            <button
              onClick={() => setTwoFactor(!twoFactor)}
              className={`relative h-6 w-11 rounded-full transition ${
                twoFactor ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
                twoFactor ? "translate-x-5" : ""
              }`} />
            </button>
          </div>
          {twoFactor && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">QR code et codes de récupération apparaîtront ici</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "data",
      icon: "⚠️",
      title: "Zone de danger",
      content: (
        <div className="space-y-3">
          <button className="w-full rounded-lg border border-[var(--status-danger)]/30 bg-[var(--status-danger-bg)] px-4 py-2.5 text-sm font-medium text-[var(--status-danger)] transition hover:bg-[var(--status-danger)]/20 active:scale-[0.98] min-h-[44px]">
            {lang === "ar" ? "تصدير البيانات (GDPR)" : lang === "fr" ? "Exporter les données (RGPD)" : "Export data (GDPR)"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full rounded-lg border border-[var(--status-danger)]/30 px-4 py-2.5 text-sm font-medium text-[var(--status-danger)] transition hover:bg-[var(--status-danger-bg)] active:scale-[0.98] min-h-[44px]"
          >
            {lang === "ar" ? "حذف جميع البيانات" : lang === "fr" ? "Supprimer toutes les données" : "Delete all organization data"}
          </button>
          {showDeleteConfirm && (
            <div className="rounded-lg border border-[var(--status-danger)] bg-[var(--status-danger-bg)] p-4">
              <p className="text-xs text-[var(--status-danger)] mb-3">
                {lang === "ar" ? "هذا الإجراء لا يمكن التراجع عنه" : lang === "fr" ? "Cette action est irréversible" : "This action cannot be undone"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-lg bg-[var(--bg-surface)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition active:scale-[0.98] min-h-[44px]"
                >
                  {lang === "ar" ? "إلغاء" : "Annuler"}
                </button>
                <button className="flex-1 rounded-lg bg-[var(--status-danger)] px-3 py-2 text-xs font-medium text-white transition active:scale-[0.98] min-h-[44px]">
                  {lang === "ar" ? "تأكيد الحذف" : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{section.icon}</span>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">{section.title}</h2>
            </div>
            {section.content}
          </div>
        ))}
      </div>
    </div>
  )
}

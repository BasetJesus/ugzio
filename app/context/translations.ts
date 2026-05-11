export type Lang = "ar" | "fr";

type Dict = Record<string, { ar: string; fr: string }>;

const dict: Dict = {
  /* ── Tabs ── */
  "tab.new-order": { ar: "طلب جديد", fr: "Nouvelle Commande" },
  "tab.orders": { ar: "الطلبات", fr: "Commandes" },
  "tab.blacklist": { ar: "القائمة السوداء", fr: "Liste Noire" },
  "tab.captions": { ar: "كابتشينات ✨", fr: "Captions ✨" },

  /* ── KPI cards ── */
  "kpi.orders-today": { ar: "طلبات اليوم", fr: "Commandes Aujourd'hui" },
  "kpi.revenue-today": { ar: "أرباح اليوم", fr: "Revenus Aujourd'hui" },
  "kpi.high-risk": { ar: "طلبات عالية الخطورة", fr: "Commandes à Risque Élevé" },
  "kpi.verification-rate": { ar: "نسبة التحقق", fr: "Taux de Vérification" },

  /* ── Risk labels ── */
  "risk.low": { ar: "مخفضة", fr: "Faible" },
  "risk.medium": { ar: "متوسطة", fr: "Moyen" },
  "risk.high": { ar: "عالية", fr: "Élevé" },
  "risk.low-long": { ar: "مخفض", fr: "RISQUE FAIBLE" },
  "risk.medium-long": { ar: "متوسط", fr: "RISQUE MOYEN" },
  "risk.high-long": { ar: "عالي", fr: "RISQUE ÉLEVÉ" },
  "risk.buyer-score": { ar: "مستوى الثقة", fr: "Score de Confiance" },
  "risk.blacklisted-warn": {
    ar: "هذا المشتري في القائمة السوداء — لا تخدمه",
    fr: "Cet acheteur est sur la liste noire — NE LIVREZ PAS",
  },

  /* ── New Order form ── */
  "order.title": { ar: "إدخال الطلب", fr: "Saisie de Commande" },
  "order.merchant": { ar: "التاجر:", fr: "Commerçant:" },
  "order.buyer-phone": { ar: "رقم المشتري", fr: "Téléphone de l'Acheteur" },
  "order.phone-placeholder": { ar: "مثال: +216 XX XXX XXX", fr: "ex: +216 XX XXX XXX" },
  "order.verification-sent": { ar: "تم إرسال التحقق إلى", fr: "Vérification envoyée à" },
  "order.buyer-name": { ar: "اسم المشتري", fr: "Nom de l'Acheteur" },
  "order.name-placeholder": { ar: "الاسم الكامل", fr: "Nom Complet" },
  "order.price": { ar: "السعر (TND)", fr: "Prix (TND)" },
  "order.product": { ar: "المنتج", fr: "Produit" },
  "order.product-placeholder": { ar: "مثال: عباية، زيت زيتون، معقّرن", fr: "ex: 3abia, zeyt zitoun, m3aqroun" },
  "order.error.required": { ar: "كل الحقول إجبارية", fr: "Tous les champs sont requis" },
  "order.error.price": { ar: "سعر غير صالح", fr: "Prix invalide" },
  "order.error.blacklist": {
    ar: "هذا المشتري في القائمة السوداء.\n\nوضع الطلب مخاطرة كبيرة.\n\nهل تريد المتابعة؟",
    fr: "Cet acheteur est sur la liste noire.\n\nPasser cette commande est à haut risque.\n\nContinuer quand même ?",
  },
  "order.success": { ar: "تم وضع الطلب لـ", fr: "Commande placée pour" },
  "order.place": { ar: "وضع الطلب", fr: "Passer Commande" },

  /* ── Orders tab ── */
  "orders.empty": { ar: "لا توجد طلبات بعد", fr: "Aucune commande pour l'instant" },
  "orders.ugc-requested": { ar: "تم طلب UGC", fr: "UGC Demandé" },
  "orders.request-ugc": { ar: "طلب UGC", fr: "Demander UGC" },
  "orders.delivered": { ar: "تم التوصيل", fr: "Livré" },
  "orders.mark-delivered": { ar: "تأكيد التوصيل", fr: "Marquer Livré" },
  "orders.verified": { ar: "✓ تم التحقق", fr: "✓ Vérifié" },

  /* ── Blacklist tab ── */
  "bl.phone-placeholder": { ar: "رقم الهاتف للإدراج", fr: "Numéro à mettre sur liste noire" },
  "bl.reason-placeholder": { ar: "السبب (اختياري)", fr: "Motif (optionnel)" },
  "bl.add": { ar: "إدراج", fr: "Ajouter" },
  "bl.empty": { ar: "لا توجد أرقام في القائمة", fr: "Aucun numéro sur liste noire" },
  "bl.remove": { ar: "إزالة", fr: "Retirer" },

  /* ── Caption Generator ── */
  "cg.edit-profile": { ar: "تعديل البروفيل", fr: "Modifier le profil" },
  "cg.topic-placeholder": { ar: "شنو تحب تبيع؟", fr: "Quoi vendre ?" },
  "cg.link-placeholder": { ar: "رابط المنتوج (اختياري)", fr: "Lien du produit (optionnel)" },
  "cg.platform-label": { ar: "المنصة", fr: "Plateforme" },
  "cg.tone-label": { ar: "النغمة", fr: "Ton" },
  "cg.generate-loading": { ar: "جاري التوليد...", fr: "Génération en cours..." },
  "cg.generate": { ar: "توليد الكابتشينات", fr: "Générer les Captions" },
  "cg.error": { ar: "فشل التوليد", fr: "Échec de la génération" },
  "cg.copied": { ar: "تم النسخ ✓", fr: "Copié ✓" },
  "cg.copy": { ar: "نسخ", fr: "Copier" },
  "cg.regenerate": { ar: "توليد بديل", fr: "Générer un autre" },
  "cg.take-photo": { ar: "تصوير", fr: "Prendre une Photo" },
  "cg.upload-gallery": { ar: "رفع من المعرض", fr: "Charger depuis la Galerie" },

  /* ── Brand Profile form ── */
  "bp.welcome": { ar: "مرحباً بيك 👋", fr: "Bienvenue 👋" },
  "bp.subtitle": {
    ar: "باش نكتبو كابتشينات على روحك، عاونّا نفهمو بزّ",
    fr: "Pour écrire des captions à ton image, aide-nous à mieux te connaître",
  },
  "bp.q1": { ar: "شنو تبيع؟", fr: "Qu'est-ce que tu vends ?" },
  "bp.q2": { ar: "مين يشري منك؟", fr: "Qui achète chez toi ?" },
  "bp.q2-placeholder": { ar: "بنات شباب، أمهات، كل الناس...", fr: "Filles, garçons, mamans, tout le monde..." },
  "bp.q3": { ar: "كيفاش تحب زبائنك يحسوا وقت يشوفوا بوستاتك؟", fr: "Comment veux-tu que tes clients se sentent en voyant tes posts ?" },
  "bp.q3-playful": { ar: "يضحكوا ويتفاعلوا", fr: "Ils rient et interagissent" },
  "bp.q3-elegant": { ar: "يحسوا بالأناقة والجودة", fr: "Ils ressentent l'élégance et la qualité" },
  "bp.q3-trustworthy": { ar: "يثقوا فيك ويشروا مباشرة", fr: "Ils te font confiance et achètent directement" },
  "bp.q4": { ar: "شنو الحاجة اللي تميزك على البقية؟", fr: "Qu'est-ce qui te rend différent des autres ?" },
  "bp.q4-placeholder": { ar: "توصيل سريع، منتجات أصلية 100%، سعر مناسب...", fr: "Livraison rapide, produits 100% originaux, prix abordable..." },
  "bp.submit": { ar: "نبدأ نولّدوا كابتشينات 🚀", fr: "Commençons à générer des captions 🚀" },

  /* ── Niche options (dropdown) ── */
  "niche.clothing": { ar: "ملابس", fr: "Vêtements" },
  "niche.cosmetics": { ar: "تجميل وعناية", fr: "Cosmétiques & Soins" },
  "niche.accessories": { ar: "إكسسوارات", fr: "Accessoires" },
  "niche.perfume": { ar: "عطور", fr: "Parfums" },
  "niche.natural": { ar: "منتجات طبيعية", fr: "Produits Naturels" },
  "niche.food": { ar: "أكل", fr: "Alimentation" },
  "niche.other": { ar: "أخرى", fr: "Autre" },

  /* ── Language toggle ── */
  "lang.ar": { ar: "العربية", fr: "العربية" },
  "lang.fr": { ar: "Français", fr: "Français" },
};

export const NICHE_KEYS = [
  "clothing", "cosmetics", "accessories", "perfume", "natural", "food", "other",
] as const;

export function t(key: string, lang: Lang): string {
  return dict[key]?.[lang] ?? key;
}

export function getDir(lang: Lang): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

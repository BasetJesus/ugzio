export type Lang = "tun" | "fr" | "en";

type Dict = Record<string, { tun: string; fr: string; en: string }>;

const dict: Dict = {
  /* ── Tabs ── */
  "tab.new-order": { tun: "طلب جديد", fr: "Nouvelle Commande", en: "New Order" },
  "tab.orders": { tun: "الطلبات", fr: "Commandes", en: "Orders" },
  "tab.blacklist": { tun: "القائمة السودا", fr: "Liste Noire", en: "Blacklist" },
  "tab.captions": { tun: "كابتشينات ✨", fr: "Captions ✨", en: "Captions ✨" },

  /* ── KPI cards ── */
  "kpi.orders-today": { tun: "طلبات اليوم", fr: "Commandes Aujourd'hui", en: "Orders Today" },
  "kpi.revenue-today": { tun: "الأرباح اليوم", fr: "Revenus Aujourd'hui", en: "Revenue Today" },
  "kpi.high-risk": { tun: "طلبات خطيرة", fr: "Commandes à Risque Élevé", en: "High Risk Orders" },
  "kpi.verification-rate": { tun: "نسبة التحقق", fr: "Taux de Vérification", en: "Verification Rate" },

  /* ── Risk labels ── */
  "risk.low": { tun: "خفيفة", fr: "Faible", en: "Low" },
  "risk.medium": { tun: "متوسطة", fr: "Moyen", en: "Medium" },
  "risk.high": { tun: "خطيرة", fr: "Élevé", en: "High" },
  "risk.low-long": { tun: "مخاطرة خفيفة", fr: "RISQUE FAIBLE", en: "LOW RISK" },
  "risk.medium-long": { tun: "مخاطرة متوسطة", fr: "RISQUE MOYEN", en: "MEDIUM RISK" },
  "risk.high-long": { tun: "مخاطرة كبيرة", fr: "RISQUE ÉLEVÉ", en: "HIGH RISK" },
  "risk.buyer-score": { tun: "سكور الثقة", fr: "Score de Confiance", en: "Trust Score" },
  "risk.blacklisted-warn": {
    tun: "هاذ المشتري في القائمة السودا — لا تخدمه",
    fr: "Cet acheteur est sur la liste noire — NE LIVREZ PAS",
    en: "This buyer is blacklisted — DO NOT SERVE",
  },

  /* ── New Order form ── */
  "order.title": { tun: "إدخال الطلب", fr: "Saisie de Commande", en: "New Order" },
  "order.merchant": { tun: "التاجر:", fr: "Commerçant:", en: "Merchant:" },
  "order.buyer-phone": { tun: "رقم المشتري", fr: "Téléphone de l'Acheteur", en: "Buyer Phone" },
  "order.phone-placeholder": { tun: "متال: +216 XX XXX XXX", fr: "ex: +216 XX XXX XXX", en: "e.g. +216 XX XXX XXX" },
  "order.verification-sent": { tun: "التحقق تاعك بعت لـ", fr: "Vérification envoyée à", en: "Verification sent to" },
  "order.buyer-name": { tun: "اسم المشتري", fr: "Nom de l'Acheteur", en: "Buyer Name" },
  "order.name-placeholder": { tun: "الاسم كامل", fr: "Nom Complet", en: "Full Name" },
  "order.price": { tun: "الثمن (TND)", fr: "Prix (TND)", en: "Price (TND)" },
  "order.product": { tun: "المنتج", fr: "Produit", en: "Product" },
  "order.product-placeholder": { tun: "متال: عباية، زيت زيتون، معقّرن", fr: "ex: 3abia, zeyt zitoun, m3aqroun", en: "e.g. 3abia, olive oil, m3aqroun" },
  "order.error.required": { tun: "كل الحقول إجبارية", fr: "Tous les champs sont requis", en: "All fields are required" },
  "order.error.price": { tun: "ثمن غير صحيح", fr: "Prix invalide", en: "Invalid price" },
  "order.error.blacklist": {
    tun: "هاذ المشتري في القائمة السودا.\n\nالطلب هذا مخاطرة كبيرة.\n\nتحب تكمّل؟",
    fr: "Cet acheteur est sur la liste noire.\n\nPasser cette commande est à haut risque.\n\nContinuer quand même ?",
    en: "This buyer is blacklisted.\n\nThis order is high risk.\n\nContinue anyway?",
  },
  "order.success": { tun: "الطلب تاع", fr: "Commande placée pour", en: "Order placed for" },
  "order.place": { tun: "اطلب", fr: "Passer Commande", en: "Place Order" },

  /* ── Orders tab ── */
  "orders.empty": { tun: "ماكاش طلبات بعد", fr: "Aucune commande pour l'instant", en: "No orders yet" },
  "orders.ugc-requested": { tun: "طلبناله UGC", fr: "UGC Demandé", en: "UGC Requested" },
  "orders.request-ugc": { tun: "اطلب UGC", fr: "Demander UGC", en: "Request UGC" },
  "orders.delivered": { tun: "وصّل", fr: "Livré", en: "Delivered" },
  "orders.mark-delivered": { tun: "تأكيد التوصيل", fr: "Marquer Livré", en: "Mark Delivered" },
  "orders.verified": { tun: "✓ تحقق", fr: "✓ Vérifié", en: "✓ Verified" },

  /* ── Blacklist tab ── */
  "bl.phone-placeholder": { tun: "رقم الهاتف باش تزود", fr: "Numéro à mettre sur liste noire", en: "Phone number to blacklist" },
  "bl.reason-placeholder": { tun: "السبب (اختياري)", fr: "Motif (optionnel)", en: "Reason (optional)" },
  "bl.add": { tun: "زود", fr: "Ajouter", en: "Add" },
  "bl.empty": { tun: "ماكاش أرقام في القائمة السودا", fr: "Aucun numéro sur liste noire", en: "No numbers on blacklist" },
  "bl.remove": { tun: "حيد", fr: "Retirer", en: "Remove" },

  /* ── Caption Generator ── */
  "cg.edit-profile": { tun: "بدّل البروفيل", fr: "Modifier le profil", en: "Edit Profile" },
  "cg.topic-placeholder": { tun: "شنو تحب تبيع؟", fr: "Quoi vendre ?", en: "What are you selling?" },
  "cg.link-placeholder": { tun: "رابط المنتوج (اختياري)", fr: "Lien du produit (optionnel)", en: "Product link (optional)" },
  "cg.platform-label": { tun: "المنصة", fr: "Plateforme", en: "Platform" },
  "cg.tone-label": { tun: "النغمة", fr: "Ton", en: "Tone" },
  "cg.generate-loading": { tun: "جاري التوليد...", fr: "Génération en cours...", en: "Generating..." },
  "cg.generate": { tun: "ولّد الكابتشينات", fr: "Générer les Captions", en: "Generate Captions" },
  "cg.error": { tun: "التوليد فشل", fr: "Échec de la génération", en: "Generation failed" },
  "cg.copied": { tun: "تم النسخ ✓", fr: "Copié ✓", en: "Copied ✓" },
  "cg.copy": { tun: "انسخ", fr: "Copier", en: "Copy" },
  "cg.regenerate": { tun: "ولّد واحد آخر", fr: "Générer un autre", en: "Regenerate" },
  "cg.take-photo": { tun: "تصوّر", fr: "Prendre une Photo", en: "Take Photo" },
  "cg.upload-gallery": { tun: "رفع من المعرض", fr: "Charger depuis la Galerie", en: "Upload from Gallery" },

  /* ── Brand Profile form ── */
  "bp.welcome": { tun: "مرحباً بيك 👋", fr: "Bienvenue 👋", en: "Welcome 👋" },
  "bp.subtitle": {
    tun: "باش نكتبو كابتشينات على روحك، عاونّا نفهموك بزّ",
    fr: "Pour écrire des captions à ton image, aide-nous à mieux te connaître",
    en: "To write captions in your style, help us understand you",
  },
  "bp.q1": { tun: "شنو تبيع؟", fr: "Qu'est-ce que tu vends ?", en: "What do you sell?" },
  "bp.q2": { tun: "شكون يشري منك؟", fr: "Qui achète chez toi ?", en: "Who buys from you?" },
  "bp.q2-placeholder": { tun: "بنات شباب، أمهات، الكل...", fr: "Filles, garçons, mamans, tout le monde...", en: "Girls, guys, moms, everyone..." },
  "bp.q3": { tun: "كيفاش تحب زبائنك يحسّوا وقت يشوفوا بوستاتك؟", fr: "Comment veux-tu que tes clients se sentent en voyant tes posts ?", en: "How should your customers feel seeing your posts?" },
  "bp.q3-playful": { tun: "يضحكوا ويتفاعلوا", fr: "Ils rient et interagissent", en: "They laugh and engage" },
  "bp.q3-elegant": { tun: "يحسّوا بالأناقة والجودة", fr: "Ils ressentent l'élégance et la qualité", en: "They feel elegance & quality" },
  "bp.q3-trustworthy": { tun: "يثقوا فيك ويشروا مباشرة", fr: "Ils te font confiance et achètent directement", en: "They trust you and buy directly" },
  "bp.q4": { tun: "شنو الحاجة اللي تفرّدك على البقية؟", fr: "Qu'est-ce qui te rend différent des autres ?", en: "What makes you different?" },
  "bp.q4-placeholder": { tun: "توصيل سريع، منتجات أصلية 100%، ثمن مناسب...", fr: "Livraison rapide, produits 100% originaux, prix abordable...", en: "Fast delivery, 100% authentic, fair price..." },
  "bp.submit": { tun: "نبدأ نولّدوا كابتشينات 🚀", fr: "Commençons à générer des captions 🚀", en: "Start Generating 🚀" },

  /* ── Niche options (dropdown) ── */
  "niche.clothing": { tun: "ملابس", fr: "Vêtements", en: "Clothing" },
  "niche.cosmetics": { tun: "تجميل وعناية", fr: "Cosmétiques & Soins", en: "Cosmetics & Care" },
  "niche.accessories": { tun: "إكسسوارات", fr: "Accessoires", en: "Accessories" },
  "niche.perfume": { tun: "عطور", fr: "Parfums", en: "Perfumes" },
  "niche.natural": { tun: "منتجات طبيعية", fr: "Produits Naturels", en: "Natural Products" },
  "niche.food": { tun: "أكل", fr: "Alimentation", en: "Food" },
  "niche.other": { tun: "حاجة أخرى", fr: "Autre", en: "Other" },

  /* ── Language toggle ── */
  "lang.tun": { tun: "العربية", fr: "العربية", en: "Arabic" },
  "lang.fr": { tun: "Français", fr: "Français", en: "Français" },
  "lang.en": { tun: "English", fr: "English", en: "English" },

  /* ── Sidebar navigation ── */
  "nav.dashboard": { tun: "الرئيسية", fr: "Tableau de bord", en: "Dashboard" },
  "nav.activate": { tun: "تفعيل", fr: "ACTIVER", en: "ACTIVATE" },
  "nav.orders": { tun: "الطلبات", fr: "Commandes", en: "Orders" },
  "nav.new-order": { tun: "+ طلب جديد", fr: "+ Nouvelle", en: "+ New Order" },
  "nav.confirm": { tun: "تأكيد", fr: "Confirmer", en: "Confirm" },
  "nav.collect": { tun: "تجميع", fr: "COLLECTER", en: "COLLECT" },
  "nav.inbox": { tun: "الوارد", fr: "Boîte", en: "Inbox" },
  "nav.track": { tun: "تتبّع", fr: "SUIVRE", en: "TRACK" },
  "nav.zioshield": { tun: "ZioShield", fr: "ZioShield", en: "ZioShield" },
  "nav.success": { tun: "النجاح", fr: "Succès", en: "Success" },
  "nav.blacklist": { tun: "القائمة السودا", fr: "Liste noire", en: "Blacklist" },
  "nav.overview": { tun: "نظرة عامة", fr: "Aperçu", en: "Overview" },
  "nav.logout": { tun: "تسجيل الخروج", fr: "Déconnexion", en: "Logout" },
  "nav.onboarding": { tun: "البداية ({n}/4)", fr: "Onboarding ({n}/4)", en: "Setup ({n}/4)" },

  /* ── Dashboard ── */
  "dash.title": { tun: "شنو اللي يخسرني فلوس اليوم؟", fr: "Qu'est-ce qui va me faire perdre de l'argent aujourd'hui ?", en: "What will lose you money today?" },
  "dash.rts-prevented": { tun: "وقاية من RTS", fr: "RTS évités", en: "RTS Prevented" },
  "dash.revenue-saved": { tun: "فلوس معقودة", fr: "Revenu sauvé", en: "Revenue Saved" },
  "dash.delivered-rate": { tun: "نسبة التوصيل", fr: "Taux livré", en: "Delivered Rate" },
  "dash.activate": { tun: "تفعيل", fr: "Activer", en: "Activate" },
  "dash.activate-desc": { tun: "متابعات واتساب بعد 3 أيام", fr: "Relances WhatsApp J+3", en: "D+3 WhatsApp follow-ups" },
  "dash.today": { tun: "اليوم", fr: "auj.", en: "today" },
  "dash.at-risk": { tun: "خطيرة", fr: "risque", en: "at risk" },
  "dash.pending": { tun: "معلّقة", fr: "en att.", en: "pending" },
  "dash.collect": { tun: "تجميع", fr: "Collecter", en: "Collect" },
  "dash.collect-desc": { tun: "UGC و المحادثات", fr: "UGC & conversations", en: "UGC & conversations" },
  "dash.track": { tun: "تتبّع", fr: "Suivre", en: "Track" },
  "dash.track-desc": { tun: "شنو يبيع و شنو لا", fr: "Ce qui convertit & pas", en: "What converts & what doesn't" },
  "dash.orders": { tun: "الطلبات", fr: "commandes", en: "orders" },
  "dash.rts-free": { tun: "بلا RTS", fr: "sans RTS", en: "RTS free" },
  "dash.inbox": { tun: "الوارد", fr: "boîte", en: "inbox" },
  "dash.new-ugc": { tun: "UGC جديد", fr: "nouveau UGC", en: "new UGC" },
  "dash.recent-orders": { tun: "آخر الطلبات", fr: "Dernières commandes", en: "Recent Orders" },
  "dash.view-all": { tun: "شوف الكل →", fr: "Voir tout →", en: "View all →" },

  /* ── Activate page ── */
  "activate.orders": { tun: "تفعيل — الطلبات", fr: "Activer — Commandes", en: "Activate — Orders" },
  "activate.new-order": { tun: "تفعيل — طلب جديد", fr: "Activer — Nouvelle commande", en: "Activate — New Order" },
  "activate.new-desc": { tun: "إضافة مشتري جديد", fr: "Créer une nouvelle commande", en: "Create a new order" },
  "activate.confirm": { tun: "تفعيل — تأكيدات", fr: "Activer — Confirmations", en: "Activate — Confirmations" },
  "activate.confirm-desc": { tun: "قائمة تأكيد واتساب بعد 3 أيام", fr: "File d'attente WhatsApp J+3", en: "D+3 WhatsApp verification queue" },

  /* ── Collect page ── */
  "collect.inbox": { tun: "تجميع — الوارد", fr: "Collecter — Boîte", en: "Collect — Inbox" },

  /* ── Track pages ── */
  "track.zioshield": { tun: "تتبّع — ZioShield", fr: "Suivre — ZioShield", en: "Track — ZioShield" },
  "track.zioshield-desc": { tun: "سكور المخاطرة و اللي يبيع", fr: "Scores de risque & ce qui convertit", en: "Risk scores & what converts" },
  "track.success": { tun: "تتبّع — النجاح", fr: "Suivre — Succès", en: "Track — Success" },
  "track.success-desc": { tun: "اللي يبيع و نتايج قابلة للتصوير", fr: "Ce qui convertit & résultats", en: "What converts & shareable results" },
  "track.blacklist": { tun: "تتبّع — القائمة السودا", fr: "Suivre — Liste noire", en: "Track — Blacklist" },

  /* ── Tone labels ── */
  "tone.calm": { tun: "هادئ", fr: "Calme", en: "Calm" },
  "tone.funny": { tun: "مضحك", fr: "Drôle", en: "Funny" },
  "tone.inspirational": { tun: "ملهم", fr: "Inspirant", en: "Inspirational" },
  "tone.strong": { tun: "قوي", fr: "Fort", en: "Strong" },

  /* ── Common ── */
  "common.new-order": { tun: "+ طلب جديد", fr: "+ Nouvelle commande", en: "+ New Order" },
  "common.no-orders": { tun: "ماكاش طلبات باش تتحقق", fr: "Aucune commande à vérifier", en: "No orders to verify" },
};

export const NICHE_KEYS = [
  "clothing", "cosmetics", "accessories", "perfume", "natural", "food", "other",
] as const;

export function t(key: string, lang: Lang): string {
  return dict[key]?.[lang] ?? key;
}

export function getDir(lang: Lang): "ltr" | "rtl" {
  return lang === "tun" ? "rtl" : "ltr";
}

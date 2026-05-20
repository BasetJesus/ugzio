import { translate as _translate, type Lang } from "@/lib/translations";

export type { Lang };
export type DictEntry = Record<Lang, string>;

const dict: Record<string, DictEntry> = {
  /* ── Tabs ── */
  "tab.new-order": { ar: "طلب جديد", fr: "Nouvelle Commande", en: "New Order" },
  "tab.orders": { ar: "الطلبات", fr: "Commandes", en: "Orders" },
  "tab.blacklist": { ar: "القائمة السودا", fr: "Liste Noire", en: "Blacklist" },
  "tab.captions": { ar: "كابتشينات ✨", fr: "Captions ✨", en: "Captions ✨" },

  /* ── KPI cards ── */
  "kpi.orders-today": { ar: "طلبات اليوم", fr: "Commandes Aujourd'hui", en: "Orders Today" },
  "kpi.revenue-today": { ar: "الأرباح اليوم", fr: "Revenus Aujourd'hui", en: "Revenue Today" },
  "kpi.high-risk": { ar: "طلبات خطيرة", fr: "Commandes à Risque Élevé", en: "High Risk Orders" },
  "kpi.verification-rate": { ar: "نسبة التحقق", fr: "Taux de Vérification", en: "Verification Rate" },

  /* ── Risk labels ── */
  "risk.low": { ar: "خفيفة", fr: "Faible", en: "Low" },
  "risk.medium": { ar: "متوسطة", fr: "Moyen", en: "Medium" },
  "risk.high": { ar: "خطيرة", fr: "Élevé", en: "High" },
  "risk.low-long": { ar: "مخاطرة خفيفة", fr: "RISQUE FAIBLE", en: "LOW RISK" },
  "risk.medium-long": { ar: "مخاطرة متوسطة", fr: "RISQUE MOYEN", en: "MEDIUM RISK" },
  "risk.high-long": { ar: "مخاطرة كبيرة", fr: "RISQUE ÉLEVÉ", en: "HIGH RISK" },
  "risk.buyer-score": { ar: "سكور الثقة", fr: "Score de Confiance", en: "Trust Score" },
  "risk.blacklisted-warn": {
    ar: "هاذ المشتري في القائمة السودا — لا تخدمه",
    fr: "Cet acheteur est sur la liste noire — NE LIVREZ PAS",
    en: "This buyer is blacklisted — DO NOT SERVE",
  },

  /* ── New Order form ── */
  "order.title": { ar: "إدخال الطلب", fr: "Saisie de Commande", en: "New Order" },
  "order.merchant": { ar: "التاجر:", fr: "Commerçant:", en: "Merchant:" },
  "order.buyer-phone": { ar: "رقم المشتري", fr: "Téléphone de l'Acheteur", en: "Buyer Phone" },
  "order.phone-placeholder": { ar: "متال: +216 XX XXX XXX", fr: "ex: +216 XX XXX XXX", en: "e.g. +216 XX XXX XXX" },
  "order.verification-sent": { ar: "التحقق تاعك بعت لـ", fr: "Vérification envoyée à", en: "Verification sent to" },
  "order.buyer-name": { ar: "اسم المشتري", fr: "Nom de l'Acheteur", en: "Buyer Name" },
  "order.name-placeholder": { ar: "الاسم كامل", fr: "Nom Complet", en: "Full Name" },
  "order.price": { ar: "الثمن (TND)", fr: "Prix (TND)", en: "Price (TND)" },
  "order.product": { ar: "المنتج", fr: "Produit", en: "Product" },
  "order.product-placeholder": { ar: "متال: عباية، زيت زيتون، معقّرن", fr: "ex: 3abia, zeyt zitoun, m3aqroun", en: "e.g. 3abia, olive oil, m3aqroun" },
  "order.error.required": { ar: "كل الحقول إجبارية", fr: "Tous les champs sont requis", en: "All fields are required" },
  "order.error.price": { ar: "ثمن غير صحيح", fr: "Prix invalide", en: "Invalid price" },
  "order.error.blacklist": {
    ar: "هاذ المشتري في القائمة السودا.\n\nالطلب هذا مخاطرة كبيرة.\n\nتحب تكمّل؟",
    fr: "Cet acheteur est sur la liste noire.\n\nPasser cette commande est à haut risque.\n\nContinuer quand même ?",
    en: "This buyer is blacklisted.\n\nThis order is high risk.\n\nContinue anyway?",
  },
  "order.success": { ar: "الطلب تاع", fr: "Commande placée pour", en: "Order placed for" },
  "order.place": { ar: "اطلب", fr: "Passer Commande", en: "Place Order" },

  /* ── Orders tab ── */
  "orders.empty": { ar: "ماكاش طلبات بعد", fr: "Aucune commande pour l'instant", en: "No orders yet" },
  "orders.ugc-requested": { ar: "طلبناله UGC", fr: "UGC Demandé", en: "UGC Requested" },
  "orders.request-ugc": { ar: "اطلب UGC", fr: "Demander UGC", en: "Request UGC" },
  "orders.delivered": { ar: "وصّل", fr: "Livré", en: "Delivered" },
  "orders.mark-delivered": { ar: "تأكيد التوصيل", fr: "Marquer Livré", en: "Mark Delivered" },
  "orders.verified": { ar: "✓ تحقق", fr: "✓ Vérifié", en: "✓ Verified" },

  /* ── Blacklist tab ── */
  "bl.phone-placeholder": { ar: "رقم الهاتف باش تزود", fr: "Numéro à mettre sur liste noire", en: "Phone number to blacklist" },
  "bl.reason-placeholder": { ar: "السبب (اختياري)", fr: "Motif (optionnel)", en: "Reason (optional)" },
  "bl.add": { ar: "زود", fr: "Ajouter", en: "Add" },
  "bl.empty": { ar: "ماكاش أرقام في القائمة السودا", fr: "Aucun numéro sur liste noire", en: "No numbers on blacklist" },
  "bl.remove": { ar: "حيد", fr: "Retirer", en: "Remove" },

  /* ── Caption Generator ── */
  "captions.title": { ar: "كابتشينات", fr: "Captions", en: "Captions" },
  "cg.edit-profile": { ar: "بدّل البروفيل", fr: "Modifier le profil", en: "Edit Profile" },
  "cg.topic-placeholder": { ar: "شنو تحب تبيع؟", fr: "Quoi vendre ?", en: "What are you selling?" },
  "cg.link-placeholder": { ar: "رابط المنتوج (اختياري)", fr: "Lien du produit (optionnel)", en: "Product link (optional)" },
  "cg.platform-label": { ar: "المنصة", fr: "Plateforme", en: "Platform" },
  "cg.tone-label": { ar: "النغمة", fr: "Ton", en: "Tone" },
  "cg.generate-loading": { ar: "جاري التوليد...", fr: "Génération en cours...", en: "Generating..." },
  "cg.generate": { ar: "ولّد الكابتشينات", fr: "Générer les Captions", en: "Generate Captions" },
  "cg.error": { ar: "التوليد فشل", fr: "Échec de la génération", en: "Generation failed" },
  "cg.copied": { ar: "تم النسخ ✓", fr: "Copié ✓", en: "Copied ✓" },
  "cg.copy": { ar: "انسخ", fr: "Copier", en: "Copy" },
  "cg.regenerate": { ar: "ولّد واحد آخر", fr: "Générer un autre", en: "Regenerate" },
  "cg.take-photo": { ar: "تصوّر", fr: "Prendre une Photo", en: "Take Photo" },
  "cg.upload-gallery": { ar: "رفع من المعرض", fr: "Charger depuis la Galerie", en: "Upload from Gallery" },

  /* ── Brand Profile form ── */
  "bp.welcome": { ar: "مرحباً بيك 👋", fr: "Bienvenue 👋", en: "Welcome 👋" },
  "bp.subtitle": {
    ar: "باش نكتبو كابتشينات على روحك، عاونّا نفهموك بزّ",
    fr: "Pour écrire des captions à ton image, aide-nous à mieux te connaître",
    en: "To write captions in your style, help us understand you",
  },
  "bp.q1": { ar: "شنو تبيع؟", fr: "Qu'est-ce que tu vends ?", en: "What do you sell?" },
  "bp.q2": { ar: "شكون يشري منك؟", fr: "Qui achète chez toi ?", en: "Who buys from you?" },
  "bp.q2-placeholder": { ar: "بنات شباب، أمهات، الكل...", fr: "Filles, garçons, mamans, tout le monde...", en: "Girls, guys, moms, everyone..." },
  "bp.q3": { ar: "كيفاش تحب زبائنك يحسّوا وقت يشوفوا بوستاتك؟", fr: "Comment veux-tu que tes clients se sentent en voyant tes posts ?", en: "How should your customers feel seeing your posts?" },
  "bp.q3-playful": { ar: "يضحكوا ويتفاعلوا", fr: "Ils rient et interagissent", en: "They laugh and engage" },
  "bp.q3-elegant": { ar: "يحسّوا بالأناقة والجودة", fr: "Ils ressentent l'élégance et la qualité", en: "They feel elegance & quality" },
  "bp.q3-trustworthy": { ar: "يثقوا فيك ويشروا مباشرة", fr: "Ils te font confiance et achètent directement", en: "They trust you and buy directly" },
  "bp.q4": { ar: "شنو الحاجة اللي تفرّدك على البقية؟", fr: "Qu'est-ce qui te rend différent des autres ?", en: "What makes you different?" },
  "bp.q4-placeholder": { ar: "توصيل سريع، منتجات أصلية 100%، ثمن مناسب...", fr: "Livraison rapide, produits 100% originaux, prix abordable...", en: "Fast delivery, 100% authentic, fair price..." },
  "bp.submit": { ar: "نبدأ نولّدوا كابتشينات 🚀", fr: "Commençons à générer des captions 🚀", en: "Start Generating 🚀" },

  /* ── Niche options (dropdown) ── */
  "niche.clothing": { ar: "ملابس", fr: "Vêtements", en: "Clothing" },
  "niche.cosmetics": { ar: "تجميل وعناية", fr: "Cosmétiques & Soins", en: "Cosmetics & Care" },
  "niche.accessories": { ar: "إكسسوارات", fr: "Accessoires", en: "Accessories" },
  "niche.perfume": { ar: "عطور", fr: "Parfums", en: "Perfumes" },
  "niche.natural": { ar: "منتجات طبيعية", fr: "Produits Naturels", en: "Natural Products" },
  "niche.food": { ar: "أكل", fr: "Alimentation", en: "Food" },
  "niche.other": { ar: "حاجة أخرى", fr: "Autre", en: "Other" },

  /* ── Language toggle ── */
  "lang.ar": { ar: "العربية", fr: "العربية", en: "Arabic" },
  "lang.fr": { ar: "Français", fr: "Français", en: "Français" },
  "lang.en": { ar: "English", fr: "English", en: "English" },

  /* ── Sidebar navigation ── */
  "nav.protect": { ar: "حماية", fr: "PROTECTION", en: "PROTECT" },
  "nav.grow": { ar: "نمو", fr: "CROISSANCE", en: "GROW" },
  "nav.dashboard": { ar: "الرئيسية", fr: "Tableau de bord", en: "Dashboard" },
  "nav.activate": { ar: "تفعيل", fr: "ACTIVER", en: "ACTIVATE" },
  "nav.orders": { ar: "الطلبات", fr: "Commandes", en: "Orders" },
  "nav.new-order": { ar: "+ طلب جديد", fr: "+ Nouvelle", en: "+ New Order" },
  "nav.confirm": { ar: "تأكيد", fr: "Confirmer", en: "Confirm" },
  "nav.collect": { ar: "تجميع", fr: "COLLECTER", en: "COLLECT" },
  "nav.capture": { ar: "التقاط", fr: "Capture", en: "Capture" },
  "nav.inbox": { ar: "الوارد", fr: "Boîte", en: "Inbox" },
  "nav.growth": { ar: "نمو", fr: "Croissance", en: "Growth" },
  "nav.captions": { ar: "كابتشين", fr: "Captions", en: "Captions" },
  "nav.shield": { ar: "شيلد", fr: "Bouclier", en: "Shield" },
  "nav.flow": { ar: "تدفق", fr: "Flux", en: "Flow" },
  "nav.stats": { ar: "إحصائيات", fr: "Statistiques", en: "Stats" },
  "nav.track": { ar: "تتبّع", fr: "SUIVRE", en: "TRACK" },
  "nav.zioshield": { ar: "ZioShield", fr: "ZioShield", en: "ZioShield" },
  "nav.success": { ar: "النجاح", fr: "Succès", en: "Success" },
  "nav.blacklist": { ar: "القائمة السودا", fr: "Liste noire", en: "Blacklist" },
  "nav.overview": { ar: "نظرة عامة", fr: "Aperçu", en: "Overview" },
  "nav.import": { ar: "استيراد", fr: "Importer", en: "Import" },
  "nav.settings": { ar: "الإعدادات", fr: "Paramètres", en: "Settings" },
  "nav.logout": { ar: "تسجيل الخروج", fr: "Déconnexion", en: "Logout" },
  "nav.onboarding": { ar: "البداية ({n}/4)", fr: "Onboarding ({n}/4)", en: "Setup ({n}/4)" },

  /* ── Dashboard ── */
  "dash.title": { ar: "شنو اللي يخسرني فلوس اليوم؟", fr: "Qu'est-ce qui va me faire perdre de l'argent aujourd'hui ?", en: "What will lose you money today?" },
  "dash.rts-prevented": { ar: "وقاية من RTS", fr: "RTS évités", en: "RTS Prevented" },
  "dash.revenue-saved": { ar: "فلوس معقودة", fr: "Revenu sauvé", en: "Revenue Saved" },
  "dash.delivered-rate": { ar: "نسبة التوصيل", fr: "Taux livré", en: "Delivered Rate" },
  "dash.activate": { ar: "تفعيل", fr: "Activer", en: "Activate" },
  "dash.activate-desc": { ar: "متابعات واتساب بعد 3 أيام", fr: "Relances WhatsApp J+3", en: "D+3 WhatsApp follow-ups" },
  "dash.today": { ar: "اليوم", fr: "auj.", en: "today" },
  "dash.at-risk": { ar: "خطيرة", fr: "risque", en: "at risk" },
  "dash.pending": { ar: "معلّقة", fr: "en att.", en: "pending" },
  "dash.collect": { ar: "تجميع", fr: "Collecter", en: "Collect" },
  "dash.collect-desc": { ar: "UGC و المحادثات", fr: "UGC & conversations", en: "UGC & conversations" },
  "dash.track": { ar: "تتبّع", fr: "Suivre", en: "Track" },
  "dash.track-desc": { ar: "شنو يبيع و شنو لا", fr: "Ce qui convertit & pas", en: "What converts & what doesn't" },
  "dash.orders": { ar: "الطلبات", fr: "commandes", en: "orders" },
  "dash.rts-free": { ar: "بلا RTS", fr: "sans RTS", en: "RTS free" },
  "dash.inbox": { ar: "الوارد", fr: "boîte", en: "inbox" },
  "dash.new-ugc": { ar: "UGC جديد", fr: "nouveau UGC", en: "new UGC" },
  "dash.recent-orders": { ar: "آخر الطلبات", fr: "Dernières commandes", en: "Recent Orders" },
  "dash.view-all": { ar: "شوف الكل →", fr: "Voir tout →", en: "View all →" },

  /* ── Activate page ── */
  "activate.orders": { ar: "تفعيل — الطلبات", fr: "Activer — Commandes", en: "Activate — Orders" },
  "activate.new-order": { ar: "تفعيل — طلب جديد", fr: "Activer — Nouvelle commande", en: "Activate — New Order" },
  "activate.new-desc": { ar: "إضافة مشتري جديد", fr: "Créer une nouvelle commande", en: "Create a new order" },
  "activate.confirm": { ar: "تفعيل — تأكيدات", fr: "Activer — Confirmations", en: "Activate — Confirmations" },
  "activate.confirm-desc": { ar: "قائمة تأكيد واتساب بعد 3 أيام", fr: "File d'attente WhatsApp J+3", en: "D+3 WhatsApp verification queue" },

  /* ── Collect page ── */
  "collect.inbox": { ar: "تجميع — الوارد", fr: "Collecter — Boîte", en: "Collect — Inbox" },

  /* ── Track pages ── */
  "track.zioshield": { ar: "تتبّع — ZioShield", fr: "Suivre — ZioShield", en: "Track — ZioShield" },
  "track.zioshield-desc": { ar: "سكور المخاطرة و اللي يبيع", fr: "Scores de risque & ce qui convertit", en: "Risk scores & what converts" },
  "track.success": { ar: "تتبّع — النجاح", fr: "Suivre — Succès", en: "Track — Success" },
  "track.success-desc": { ar: "اللي يبيع و نتايج قابلة للتصوير", fr: "Ce qui convertit & résultats", en: "What converts & shareable results" },
  "track.blacklist": { ar: "تتبّع — القائمة السودا", fr: "Suivre — Liste noire", en: "Track — Blacklist" },

  /* ── Tone labels ── */
  "tone.calm": { ar: "هادئ", fr: "Calme", en: "Calm" },
  "tone.funny": { ar: "مضحك", fr: "Drôle", en: "Funny" },
  "tone.inspirational": { ar: "ملهم", fr: "Inspirant", en: "Inspirational" },
  "tone.strong": { ar: "قوي", fr: "Fort", en: "Strong" },

  /* ── Common ── */
  "common.new-order": { ar: "+ طلب جديد", fr: "+ Nouvelle commande", en: "+ New Order" },
  "common.no-orders": { ar: "ماكاش طلبات باش تتحقق", fr: "Aucune commande à vérifier", en: "No orders to verify" },
  "common.import": { ar: "استيراد", fr: "Importer", en: "Import" },
  "common.save": { ar: "حفظ", fr: "Enregistrer", en: "Save" },
  "common.cancel": { ar: "إلغاء", fr: "Annuler", en: "Cancel" },
  "common.back": { ar: "رجوع", fr: "Retour", en: "Back" },

  /* ── Overview page ── */
  "ov.revenue-at-risk": { ar: "الإيرادات المعرضة للخطر", fr: "Revenu en risque", en: "Revenue at Risk" },
  "ov.revenue-live": { ar: "الإيرادات المباشرة", fr: "Revenu en direct", en: "Live Revenue" },
  "ov.orders-to-process": { ar: "الطلبات للمعالجة", fr: "Commandes à traiter", en: "Orders to Process" },
  "ov.protection-status": { ar: "حالة الحماية", fr: "État de protection", en: "Protection Status" },
  "ov.active": { ar: "نشط", fr: "Active", en: "Active" },
  "ov.stable": { ar: "مستقر", fr: "Stable", en: "Stable" },
  "ov.needs-action": { ar: "⚡ يتطلب إجراء فوري", fr: "⚡ Nécessite une action immédiate", en: "⚡ Needs immediate action" },
  "ov.decisions-pending": { ar: "⚠️ قرارات معلقة", fr: "⚠️ Décisions en attente", en: "⚠️ Decisions pending" },
  "ov.all-protected": { ar: "🛡️ كل شيء محمي", fr: "🛡️ Tout est protégé", en: "🛡️ All protected" },
  "ov.protected-revenue": { ar: "الإيرادات المحمية", fr: "Revenu protégé", en: "Protected Revenue" },
  "ov.rts-prevented": { ar: "خسائر RTS المتفاداة", fr: "Pertes RTS évitées", en: "RTS Losses Prevented" },
  "ov.confirmation-rate": { ar: "معدل التأكيد", fr: "Taux de confirmation", en: "Confirmation Rate" },
  "ov.actions-taken": { ar: "الإجراءات المتخذة", fr: "Actions prises", en: "Actions Taken" },
  "ov.empty-title": { ar: "كول شي تحت السيطرة", fr: "Koul chay t7at l control", en: "Everything under control" },
  "ov.empty-link": { ar: "اذهب إلى قائمة التأكيد", fr: "Va à la file de confirmation", en: "Go to the confirmation queue" },
  "ov.empty-desc": { ar: "لبدء حماية إيراداتك", fr: "pour commencer à protéger ton revenu", en: "to start protecting your revenue" },
  "ov.section-protection": { ar: "حماية", fr: "Protection", en: "Protection" },
  "ov.section-act": { ar: "تصرف", fr: "Agir", en: "Act" },
  "ov.section-growth": { ar: "نمو", fr: "Croissance", en: "Growth" },
  "ov.results-today": { ar: "نتائج اليوم", fr: "Résultats du jour", en: "Today's Results" },
  "ov.at-risk-amount": { ar: "{n} TND في خطر", fr: "{n} TND en risque", en: "{n} TND at risk" },
  "ov.pending-count": { ar: "{n} معلقة", fr: "{n} en attente", en: "{n} pending" },
  "ov.loop-completed": { ar: "الدورة مكتملة", fr: "Boucle terminée", en: "Loop Completed" },
  "ov.learning-signals": { ar: "إشارات التعلم", fr: "Signaux d'apprentissage", en: "Learning Signals" },
  "ov.completion-rate": { ar: "معدل الإكمال", fr: "Taux d'achèvement", en: "Completion Rate" },
  "ov.section-learning": { ar: "التعلم", fr: "Apprentissage", en: "Learning" },
  "ov.loop-description": { ar: "الطلبات التي أكملت الدورة التشغيلية", fr: "Commandes qui ont terminé le cycle opérationnel", en: "Orders that completed the operational loop" },

  /* ── Confirm page ── */
  "cf.title-pending": { ar: "طلبات معلقة", fr: "Commandes en attente", en: "Pending Orders" },
  "cf.title-idle": { ar: "قائمة القرار", fr: "File de décision", en: "Decision Queue" },
  "cf.orders-at-risk": { ar: "طلبات خطيرة", fr: "Commandes à risque", en: "Orders at Risk" },
  "cf.pending": { ar: "معلقة", fr: "En attente", en: "Pending" },
  "cf.losses-prevented": { ar: "خسائر متفاداة", fr: "Pertes évitées", en: "Losses Prevented" },
  "cf.all-clear": { ar: "كل الطلبات تم التحقق منها", fr: "Toutes les commandes ont été vérifiées", en: "All orders verified" },

  /* ── Orders page ── */
  "ord.title": { ar: "سجل الطلبات", fr: "Historique des commandes", en: "Order History" },

  /* ── Blacklist page ── */
  "bl.title": { ar: "القائمة السودا", fr: "Liste noire", en: "Blacklist" },
  "bl.desc": { ar: "الأرقام في القائمة السودا سيتم حظرها عند إنشاء الطلب", fr: "Les numéros sur liste noire seront bloqués à la création de commande", en: "Blacklisted numbers will be blocked at order creation" },

  /* ── Inbox page ── */
  "inbox.title": { ar: "صندوق UGC", fr: "Boîte UGC", en: "UGC Inbox" },

  /* ── Order Status ── */
  "status.created": { ar: "تم الإنشاء", fr: "Créée", en: "Created" },
  "status.confirmed": { ar: "مؤكد", fr: "Confirmée", en: "Confirmed" },
  "status.shipped": { ar: "تم الشحن", fr: "Expédiée", en: "Shipped" },
  "status.delivered": { ar: "تم التسليم", fr: "Livrée", en: "Delivered" },
  "status.refused": { ar: "مرفوض", fr: "Refusée", en: "Refused" },
  "status.cancelled": { ar: "ملغى", fr: "Annulée", en: "Cancelled" },

  /* ── Actions ── */
  "actions.verify": { ar: "تحقق", fr: "Vérifier", en: "Verify" },
  "actions.ship": { ar: "شحن", fr: "Expédier", en: "Ship" },
  "actions.block": { ar: "حظر", fr: "Bloquer", en: "Block" },
  "actions.contact": { ar: "تواصل", fr: "Contacter", en: "Contact" },
  "actions.viewDetails": { ar: "عرض التفاصيل", fr: "Voir détails", en: "View details" },

  /* ── Confirm prompt ── */
  "confirm.question": { ar: "هل تؤكد استلام طلبك؟", fr: "Confirmez-vous votre commande?", en: "Confirm your order?" },
  "confirm.yes": { ar: "نعم، أؤكد", fr: "Oui, je confirme", en: "Yes, confirm" },
  "confirm.reschedule": { ar: "وقت آخر", fr: "Autre moment", en: "Reschedule" },
  "confirm.cancel": { ar: "إلغاء", fr: "Annuler", en: "Cancel" },

  /* ── Risk labels (legacy aliases) ── */
  "risk.blocked": { ar: "محظور", fr: "Bloqué", en: "Blocked" },

  /* ── KPI cards (legacy camelCase aliases) ── */
  "kpi.ordersToday": { ar: "طلبات اليوم", fr: "Commandes aujourd'hui", en: "Orders Today" },
  "kpi.highRisk": { ar: "خطر عالٍ", fr: "Risque élevé", en: "High Risk" },
  "kpi.revenueSaved": { ar: "إيرادات محفوظة", fr: "Revenus sauvegardés", en: "Revenue Saved" },
  "kpi.rtsPrevented": { ar: "إرجاع منع", fr: "Retours évités", en: "RTS Prevented" },

  /* ── Outcome labels ── */
  "outcome.delivered": { ar: "😊 تم التسليم", fr: "😊 Livré", en: "😊 Delivered" },
  "outcome.refused": { ar: "😞 مرفوض", fr: "😞 Refusé", en: "😞 Refused" },
  "outcome.unreachable": { ar: "📵 لا يرد", fr: "📵 Injoignable", en: "📵 Unreachable" },

  /* ── Sidebar ── */
  "nav.protection": { ar: "حماية", fr: "Protection", en: "Protection" },
  "nav.ugc": { ar: "UGC", fr: "UGC", en: "UGC" },
  "nav.ugc-desc": { ar: "الموافقات", fr: "Approbations", en: "Approvals" },
  "nav.blacklist-desc": { ar: "الأرقام المحظورة", fr: "Numéros bloqués", en: "Blocked Numbers" },
  "nav.state-live": { ar: "مباشر", fr: "Live", en: "Live" },
  "nav.state-decision": { ar: "قرار", fr: "Décision", en: "Decision" },
  "nav.state-history": { ar: "السجل", fr: "Historique", en: "History" },
  "nav.state-live-desc": { ar: "ماذا يحدث الآن", fr: "En direct", en: "Live now" },
  "nav.state-decision-desc": { ar: "ما يحتاج إلى إجراء", fr: "Actions requises", en: "Needs action" },
  "nav.state-history-desc": { ar: "ماذا حدث", fr: "Ce qui s'est passé", en: "What happened" },
};

export const NICHE_KEYS = [
  "clothing", "cosmetics", "accessories", "perfume", "natural", "food", "other",
] as const;

export function t(key: string, lang: Lang): string {
  const localized = dict[key]?.[lang]
  if (localized !== undefined) return localized
  return _translate(key, lang)
}

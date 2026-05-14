import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Plans (MVP) ──
  const free = await prisma.plan.upsert({
    where: { name: "free" },
    update: {},
    create: {
      name: "free",
      maxOrdersPerMonth: 3,
      maxUsersPerOrg: 1,
      hasZioConfirm: true,
      hasZioBrain: false,
      hasZioConnect: false,
      hasZioFlow: false,
      hasZioNetwork: false,
      aiInsightsPerMonth: 0,
      verificationsPerMonth: 3,
      price: 0,
      currency: "TND",
    },
  });

  const croissance = await prisma.plan.upsert({
    where: { name: "croissance" },
    update: {},
    create: {
      name: "croissance",
      maxOrdersPerMonth: 99999,
      maxUsersPerOrg: 3,
      hasZioConfirm: true,
      hasZioBrain: true,
      hasZioConnect: false,
      hasZioFlow: false,
      hasZioNetwork: false,
      aiInsightsPerMonth: 99999,
      verificationsPerMonth: 99999,
      price: 129,
      currency: "TND",
    },
  });

  console.log("Seeded plans:", { free: free.name, croissance: croissance.name });

  // ── Feature Flags ──
  const flags = [
    { key: "zioshield", description: "ZioShield risk scoring engine", planGate: null },
    { key: "zioconfirm", description: "ZioConfirm WhatsApp verification", planGate: null },
    { key: "zioinbox", description: "ZioInbox unified conversations", planGate: null },
    { key: "zioanalytics", description: "ZioAnalytics dashboard charts", planGate: null },
    { key: "ziobrain", description: "ZioBrain AI insights", planGate: "croissance" },
    { key: "zioconnect", description: "ZioConnect Shopify integration", planGate: "croissance" },
    { key: "zioflow", description: "ZioFlow workflow automation", planGate: "croissance" },
    { key: "zionetwork", description: "ZioNetwork cross-seller fraud graph", planGate: "croissance" },
  ];

  for (const f of flags) {
    const flag = await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: {},
      create: { key: f.key, enabled: true, description: f.description, planGate: f.planGate },
    });
    console.log(`Seeded flag: ${flag.key}`);
  }

  // ── Step 1: Fake Sellers / Organizations ──
  const existingDemo = await prisma.user.findUnique({ where: { email: "amine@demo.tn" } });
  if (existingDemo) {
    console.log("Demo data already exists — skipping seed data creation");
    return;
  }

  const password = await bcrypt.hash("password123", 12);

  const sellers = [
    {
      email: "amine@demo.tn",
      name: "Amine Ben Ali",
      orgName: "Électronique Mega",
      slug: "electronique-mega",
      sellerPhone: "+21650123456",
      wilaya: "Tunis",
    },
    {
      email: "sarra@demo.tn",
      name: "Sarra Mejri",
      orgName: "Mode Orientale",
      slug: "mode-orientale",
      sellerPhone: "+21650234567",
      wilaya: "Sfax",
    },
    {
      email: "karim@demo.tn",
      name: "Karim Hassen",
      orgName: "Sportify TN",
      slug: "sportify-tn",
      sellerPhone: "+21650345678",
      wilaya: "Sousse",
    },
  ];

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  for (const s of sellers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { email: s.email, name: s.name, password },
    });

    const org = await prisma.organization.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        name: s.orgName,
        slug: s.slug,
        sellerPhone: s.sellerPhone,
        sellerName: s.name,
        maxOrdersPerMonth: 3,
        subscriptionStatus: "free",
        ordersThisMonth: 0,
      },
    });

    await prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
      update: {},
      create: { organizationId: org.id, userId: user.id, role: "owner" },
    });

    await prisma.subscription.upsert({
      where: { organizationId: org.id },
      update: {},
      create: {
        organizationId: org.id,
        planId: free.id,
        status: "active",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });

    await prisma.usageMeter.upsert({
      where: { id: `usage-${org.id}-${periodStart.toISOString()}` },
      update: {},
      create: {
        id: `usage-${org.id}-${periodStart.toISOString()}`,
        organizationId: org.id,
        periodStart,
        periodEnd,
        ordersProcessed: 0,
        aiInsightsGenerated: 0,
        verificationsSent: 0,
        aiTokensUsed: 0,
        ordersLimit: 3,
        aiInsightsLimit: 0,
        verificationsLimit: 3,
      },
    });

    console.log(`Seeded seller: ${s.name} (${s.orgName}, ${s.wilaya})`);
  }

  // ── Step 2: Fake Buyers + Orders ──
  const allOrgs = await prisma.organization.findMany();

  const amineOrg = allOrgs.find((o) => o.slug === "electronique-mega")!;
  const sarraOrg = allOrgs.find((o) => o.slug === "mode-orientale")!;
  const karimOrg = allOrgs.find((o) => o.slug === "sportify-tn")!;

  type BuyerDef = { name: string; phone: string; risk: number };
  type OrderDef = {
    buyer: BuyerDef;
    product: string;
    amount: number;
    status: string;
    wilaya: string;
    riskLevel: string;
    trustScore: number;
    createdAt: Date;
  };

  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

  // --- Orders for Amine (Électronique Mega) ---
  const amineBuyers: BuyerDef[] = [
    { name: "Mohamed Salah", phone: "+21698111111", risk: 25 },
    { name: "Ahmed Bouchrika", phone: "+21698222222", risk: 55 },
    { name: "Haithem Kacem", phone: "+21698333333", risk: 80 },
  ];

  const amineOrders: OrderDef[] = [
    {
      buyer: amineBuyers[0],
      product: "TV Samsung 55\"",
      amount: 1200,
      status: "UGC_RECEIVED",
      wilaya: "Tunis",
      riskLevel: "low",
      trustScore: 85,
      createdAt: daysAgo(10),
    },
    {
      buyer: amineBuyers[1],
      product: "Smartphone Xiaomi",
      amount: 850,
      status: "PENDING_RESCHEDULE",
      wilaya: "Nabeul",
      riskLevel: "medium",
      trustScore: 50,
      createdAt: daysAgo(3),
    },
    {
      buyer: amineBuyers[2],
      product: "Écouteurs Bluetooth",
      amount: 150,
      status: "REFUSED",
      wilaya: "Bizerte",
      riskLevel: "high",
      trustScore: 20,
      createdAt: daysAgo(7),
    },
  ];

  // --- Orders for Sarra (Mode Orientale) ---
  const sarraBuyers: BuyerDef[] = [
    { name: "Nour Ben Romdhane", phone: "+21698444444", risk: 30 },
    { name: "Ines Gharbi", phone: "+21698555555", risk: 45 },
  ];

  const sarraOrders: OrderDef[] = [
    {
      buyer: sarraBuyers[0],
      product: "Robe cérémonie",
      amount: 220,
      status: "UGC_REQUESTED",
      wilaya: "Sfax",
      riskLevel: "low",
      trustScore: 75,
      createdAt: daysAgo(5),
    },
    {
      buyer: sarraBuyers[1],
      product: "Sac à main cuir",
      amount: 350,
      status: "SHIPPED",
      wilaya: "Gabès",
      riskLevel: "medium",
      trustScore: 60,
      createdAt: daysAgo(2),
    },
  ];

  // --- Orders for Karim (Sportify TN) ---
  const karimBuyers: BuyerDef[] = [
    { name: "Oussema Jaziri", phone: "+21698666666", risk: 40 },
    { name: "Youssef Mnasser", phone: "+21698777777", risk: 90 },
  ];

  const karimOrders: OrderDef[] = [
    {
      buyer: karimBuyers[0],
      product: "Maillot ESS",
      amount: 90,
      status: "CREATED",
      wilaya: "Sousse",
      riskLevel: "medium",
      trustScore: 55,
      createdAt: daysAgo(1),
    },
    {
      buyer: karimBuyers[1],
      product: "Chaussures running",
      amount: 280,
      status: "INTELLIGENT_CANCEL",
      wilaya: "Monastir",
      riskLevel: "high",
      trustScore: 10,
      createdAt: daysAgo(4),
    },
  ];

  async function seedOrder(org: typeof amineOrg, order: OrderDef) {
    const buyer = order.buyer;

    const anonymizedId = `anon-${buyer.phone.replace(/\D/g, "")}`;
    await prisma.buyerIdentity.upsert({
      where: { anonymizedId },
      update: {},
      create: {
        anonymizedId,
        riskScore: buyer.risk,
        networkMlScore: buyer.risk,
        totalOrders: 1,
        failedOrders: order.status === "REFUSED" || order.status === "INTELLIGENT_CANCEL" ? 1 : 0,
        successfulOrders: order.status === "UGC_RECEIVED" || order.status === "UGC_REQUESTED" || order.status === "DELIVERED" ? 1 : 0,
        blacklistedCount: order.status === "INTELLIGENT_CANCEL" ? 1 : 0,
      },
    });

    const created = await prisma.order.create({
      data: {
        organizationId: org.id,
        buyerName: buyer.name,
        buyerPhone: buyer.phone,
        product: order.product,
        buyerWilaya: order.wilaya,
        amount: order.amount,
        status: order.status,
        riskLevel: order.riskLevel,
        trustScore: order.trustScore,
        createdAt: order.createdAt,
      },
    });

    if (order.status === "UGC_RECEIVED") {
      await prisma.ugcItem.create({
        data: {
          orderId: created.id,
          mediaUrl: "https://placehold.co/400x400/purple/white?text=UGC",
          mediaType: "image",
          buyerPhone: buyer.phone,
          status: "received",
          createdAt: daysAgo(2),
        },
      });
    }

    console.log(`  Order: ${buyer.name} — ${order.product} (${order.amount} TND) [${order.status}]`);
  }

  for (const o of amineOrders) await seedOrder(amineOrg, o);
  for (const o of sarraOrders) await seedOrder(sarraOrg, o);
  for (const o of karimOrders) await seedOrder(karimOrg, o);

  // ── Step 2.5: Default UGC Request Templates ──

  const DEFAULT_UGC_TEMPLATES = [
    {
      name: "Photo Review — 15 TND",
      requestType: "photo_review",
      messageBody: "Hey {{buyerName}}! 🎉 Tu as reçu ton {{product}} — ça t'a plu ? Envoie-nous une photo et on te crédite {{incentive}} sur ta prochaine commande 🎁",
      incentive: "15 TND",
    },
    {
      name: "Instagram Story — 15 TND",
      requestType: "instagram_story",
      messageBody: "Salut {{buyerName}} 🙌 On adorerait voir ton {{product}} en action ! Tagge-nous dans ta story Instagram et reçois {{incentive}} de réduction 🎁",
      incentive: "15 TND",
    },
    {
      name: "TikTok Unboxing — 20 TND",
      requestType: "tiktok_unboxing",
      messageBody: "Hey {{buyerName}}! Tu veux participer à notre défi unboxing ? 🎬 Filme ton déballage du {{product}}, poste-le sur TikTok et gagne {{incentive}} 🎉",
      incentive: "20 TND",
    },
    {
      name: "Written Testimonial",
      requestType: "written_testimonial",
      messageBody: "{{buyerName}}! On a adoré te compter parmi nos clients. Tu peux nous laisser un petit mot sur ce que tu as pensé du {{product}} ? 📝✨",
      incentive: "",
    },
    {
      name: "WhatsApp Feedback",
      requestType: "whatsapp_feedback",
      messageBody: "Salam {{buyerName}}! Comment s'est passée la réception du {{product}} ? Un petit feedback nous ferait plaisir 💬🙏",
      incentive: "",
    },
  ];

  for (const org of allOrgs) {
    for (const tpl of DEFAULT_UGC_TEMPLATES) {
      const existing = await prisma.ugcRequestTemplate.findFirst({
        where: { organizationId: org.id, name: tpl.name },
      });
      if (!existing) {
        await prisma.ugcRequestTemplate.create({
          data: {
            organizationId: org.id,
            name: tpl.name,
            requestType: tpl.requestType,
            messageBody: tpl.messageBody,
            incentive: tpl.incentive,
            isActive: tpl.requestType === "photo_review",
          },
        });
      }
    }
    console.log(`Seeded UGC templates for: ${org.name}`);
  }

  // ── Step 3: Conversations + Messages ──
  const allOrders = await prisma.order.findMany({ include: { organization: true } });

  for (const order of allOrders) {
    const conv = await prisma.conversation.upsert({
      where: { id: `conv-${order.id}` },
      update: {},
      create: {
        id: `conv-${order.id}`,
        organizationId: order.organizationId,
        orderId: order.id,
        buyerName: order.buyerName,
        buyerPhone: order.buyerPhone,
      },
    });

    const inboundMsgs = [
      { content: "Salam, chnawa kayen m3a had l'produit?", days: 6 },
      { content: "W9t tawsil?", days: 4 },
      { content: "Tawa3edni bekri, chnawa l'état?", days: 1 },
    ];

    const outboundMsgs = [
      { content: "Salam 3likom, le produit disponible. Tawjih during 48h.", days: 6 },
      { content: "Votre commande est confirmée. On vous tient au courant inchallah.", days: 4 },
      { content: "Le colis est en cours de livraison, vous serez notifié dès arrival.", days: 2 },
    ];

    const recentMsgs = order.status === "CREATED" || order.status === "SHIPPED" ? inboundMsgs.slice(0, 2) : inboundMsgs;
    const recentOutMsgs = order.status === "CREATED" || order.status === "SHIPPED" ? outboundMsgs.slice(0, 1) : outboundMsgs;

    for (const msg of recentMsgs) {
      const msgDate = new Date(now.getTime() - msg.days * 86_400_000);
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          direction: "inbound",
          content: msg.content,
          channel: "whatsapp",
          status: "delivered",
          createdAt: msgDate,
        },
      });
    }

    for (const msg of recentOutMsgs) {
      const msgDate = new Date(now.getTime() - msg.days * 86_400_000);
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          direction: "outbound",
          content: msg.content,
          channel: "whatsapp",
          status: "delivered",
          createdAt: msgDate,
        },
      });
    }

    console.log(`  Conv: ${order.buyerName} — ${recentMsgs.length + recentOutMsgs.length} msgs`);
  }
}

main()
  .then(() => {
    console.log("Seed complete — 3 sellers, 7 orders, 7 conversations");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

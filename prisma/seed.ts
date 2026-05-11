import { PrismaClient } from "@prisma/client";

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

  console.log("Seeded plans:", { free, croissance });

  // ── Feature Flags ──
  const flags = [
    { key: "zioshield", description: "ZioShield risk scoring engine", planGate: null },
    { key: "zioconfirm", description: "ZioConfirm WhatsApp verification", planGate: null },
    { key: "zioinbox", description: "ZioInbox unified conversations", planGate: null },
    { key: "zioanalytics", description: "ZioAnalytics dashboard charts", planGate: null },
    { key: "ziobrain", description: "ZioBrain AI insights", planGate: "grower" },
    { key: "zioconnect", description: "ZioConnect Shopify integration", planGate: "pro" },
    { key: "zioflow", description: "ZioFlow workflow automation", planGate: "pro" },
    { key: "zionetwork", description: "ZioNetwork cross-seller fraud graph", planGate: "scale" },
  ];

  for (const f of flags) {
    const flag = await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: {},
      create: { key: f.key, enabled: true, description: f.description, planGate: f.planGate },
    });
    console.log(`Seeded flag: ${flag.key}`);
  }
}

main()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Plans ──
  const starter = await prisma.plan.upsert({
    where: { name: "starter" },
    update: {},
    create: {
      name: "starter",
      maxOrdersPerMonth: 50,
      maxUsersPerOrg: 1,
      hasZioConfirm: true,
      hasZioBrain: false,
      hasZioConnect: false,
      hasZioFlow: false,
      hasZioNetwork: false,
      aiInsightsPerMonth: 0,
      verificationsPerMonth: 50,
      price: 0,
      currency: "TND",
    },
  });

  const grower = await prisma.plan.upsert({
    where: { name: "grower" },
    update: {},
    create: {
      name: "grower",
      maxOrdersPerMonth: 200,
      maxUsersPerOrg: 3,
      hasZioConfirm: true,
      hasZioBrain: true,
      hasZioConnect: false,
      hasZioFlow: false,
      hasZioNetwork: false,
      aiInsightsPerMonth: 100,
      verificationsPerMonth: 200,
      price: 29,
      currency: "TND",
    },
  });

  const pro = await prisma.plan.upsert({
    where: { name: "pro" },
    update: {},
    create: {
      name: "pro",
      maxOrdersPerMonth: 1000,
      maxUsersPerOrg: 10,
      hasZioConfirm: true,
      hasZioBrain: true,
      hasZioConnect: true,
      hasZioFlow: true,
      hasZioNetwork: false,
      aiInsightsPerMonth: 500,
      verificationsPerMonth: 1000,
      price: 79,
      currency: "TND",
    },
  });

  const scale = await prisma.plan.upsert({
    where: { name: "scale" },
    update: {},
    create: {
      name: "scale",
      maxOrdersPerMonth: 99999,
      maxUsersPerOrg: 99999,
      hasZioConfirm: true,
      hasZioBrain: true,
      hasZioConnect: true,
      hasZioFlow: true,
      hasZioNetwork: true,
      aiInsightsPerMonth: 5000,
      verificationsPerMonth: 99999,
      price: 199,
      currency: "TND",
    },
  });

  console.log("Seeded plans:", { starter, grower, pro, scale });

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

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BUYERS = [
  { name: "Amine Letaief", phone: "+21650123401", wilaya: "Tunis" },
  { name: "Sarra Mhenni", phone: "+21650123402", wilaya: "Sfax" },
  { name: "Karim Jaziri", phone: "+21650123403", wilaya: "Sousse" },
  { name: "Mariem Ben Ali", phone: "+21650123404", wilaya: "Nabeul" },
  { name: "Mehdi Khedher", phone: "+21650123405", wilaya: "Monastir" },
  { name: "Nadia Trabelsi", phone: "+21650123406", wilaya: "Gabès" },
  { name: "Hichem Gharbi", phone: "+21650123407", wilaya: "Kairouan" },
  { name: "Ines Bouazizi", phone: "+21650123408", wilaya: "Bizerte" },
  { name: "Mohamed Salah", phone: "+21650123409", wilaya: "Ariana" },
  { name: "Rania Ferchichi", phone: "+21650123410", wilaya: "Ben Arous" },
];

const PRODUCTS = [
  "Sac à main en cuir",
  "Montre connectée",
  "Parfum Oud Royal",
  "Ensemble été femme",
  "Casque Bluetooth Pro",
  "Lunettes de soleil design",
  "Tapis de prière luxe",
  "Crème visage bio",
  "T-shirt coton bio",
  "Smartwatch Sport",
];

const STATUSES = [
  "CREATED",
  "PRE_SHIPPING_CONFIRM_SENT",
  "BUYER_CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "REFUSED",
  "INTELLIGENT_CANCEL",
] as const;

function randomAmount(): number {
  return Math.round((Math.random() * 200 + 20) * 1000) / 1000;
}

function randomDaysAgo(maxDays: number): Date {
  return new Date(Date.now() - Math.floor(Math.random() * maxDays * 24 * 60 * 60 * 1000));
}

async function main() {
  const orgs = await prisma.organization.findMany({ take: 1 });
  if (orgs.length === 0) {
    console.error("No organizations found. Run seed first.");
    process.exit(1);
  }

  const orgId = orgs[0].id;
  console.log(`Simulating orders for org: ${orgs[0].name ?? orgId}`);

  let totalSimulated = 0;

  for (const buyer of BUYERS) {
    const numOrders = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < numOrders; i++) {
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      const amount = randomAmount();
      const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const createdAt = randomDaysAgo(14);

      await prisma.order.create({
        data: {
          organizationId: orgId,
          buyerName: buyer.name,
          buyerPhone: buyer.phone,
          buyerWilaya: buyer.wilaya,
          product,
          amount,
          status,
          trustScore: Math.floor(Math.random() * 100),
          riskLevel: Math.random() < 0.3 ? "high" : Math.random() < 0.6 ? "medium" : "low",
          createdAt,
        },
      });

      totalSimulated++;
      console.log(`  [${totalSimulated}] ${buyer.name} — ${status} — ${amount} TND — ${product}`);
    }
  }

  console.log(`\n✅ Simulated ${totalSimulated} orders successfully.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Simulation failed:", e);
  process.exit(1);
});


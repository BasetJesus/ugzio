import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const UGC_PHOTOS = [
  "https://images.unsplash.com/photo-1546868871-af0de0ae72f6?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop",
];

async function main() {
  const orgs = await prisma.organization.findMany();
  if (orgs.length === 0) {
    console.log("No organizations found — run the main seed first");
    return;
  }

  const allOrders = await prisma.order.findMany({
    where: { deletedAt: null },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${allOrders.length} orders across ${orgs.length} orgs`);

  let created = 0;
  let skipped = 0;

  for (const order of allOrders) {
    const existing = await prisma.ugcItem.count({ where: { orderId: order.id } });
    if (existing > 0) {
      skipped++;
      continue;
    }

    const recentEnough = order.createdAt > new Date(Date.now() - 15 * 86400000);
    if (!recentEnough) continue;

    const photoUrl = UGC_PHOTOS[created % UGC_PHOTOS.length];
    const daysAgo = Math.floor(Math.random() * 5) + 1;
    const statusOptions = ["received", "received", "received", "approved", "rejected"];
    const status = statusOptions[created % statusOptions.length];
    const createdAt = new Date(Date.now() - daysAgo * 86400000);

    await prisma.ugcItem.create({
      data: {
        orderId: order.id,
        mediaUrl: photoUrl,
        mediaType: "image",
        buyerPhone: order.buyerPhone,
        status,
        createdAt,
      },
    });

    if (status === "approved") {
      await prisma.ugcItem.create({
        data: {
          orderId: order.id,
          mediaUrl: UGC_PHOTOS[(created + 1) % UGC_PHOTOS.length],
          mediaType: "image",
          buyerPhone: order.buyerPhone,
          status: "approved",
          createdAt: new Date(createdAt.getTime() + 60000),
        },
      });
      created++;
    }

    if (order.status !== "UGC_RECEIVED") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "UGC_RECEIVED" },
      });
    }

    created++;
  }

  console.log(`Created ${created} UGC items, skipped ${skipped} orders with existing items`);
  console.log("Done — open /inbox to see the demo data");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

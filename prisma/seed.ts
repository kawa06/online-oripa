import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const cards = await Promise.all([
    prisma.card.upsert({
      where: { barcode: "BC-SEED-001" },
      update: {},
      create: {
        name: "ピカチュウ SAR",
        category: "ポケモン",
        condition: "NM",
        rank: "S",
        stockQuantity: 5,
        marketPrice: 45000,
        buyPrice: 35000,
        sellPrice: 48000,
        managementCode: "MG-SEED-001",
        barcode: "BC-SEED-001",
        imageUrl: "/placeholder/card-sar.jpg",
      },
    }),
    prisma.card.upsert({
      where: { barcode: "BC-SEED-002" },
      update: {},
      create: {
        name: "リザードン ex SR",
        category: "ポケモン",
        condition: "NM",
        rank: "A",
        stockQuantity: 10,
        marketPrice: 12000,
        buyPrice: 9000,
        sellPrice: 14000,
        managementCode: "MG-SEED-002",
        barcode: "BC-SEED-002",
      },
    }),
    prisma.card.upsert({
      where: { barcode: "BC-SEED-003" },
      update: {},
      create: {
        name: "ポケモンカード151 パック",
        category: "パック",
        condition: "未開封",
        rank: "B",
        stockQuantity: 20,
        marketPrice: 800,
        buyPrice: 600,
        sellPrice: 900,
        managementCode: "MG-SEED-003",
        barcode: "BC-SEED-003",
      },
    }),
  ]);

  const gacha = await prisma.gacha.upsert({
    where: { id: "seed-gacha-premium-001" },
    update: {},
    create: {
      id: "seed-gacha-premium-001",
      title: "プレミアムオリパ Vol.1",
      description: "人気SAR・SRが当たる高還元オリパ（サンプル）",
      pricePerPull: 500,
      totalSlots: 100,
      remainingSlots: 100,
      status: "PUBLISHED",
      publishedAt: new Date(),
      noticeText: "サンプルデータです。",
      prizes: {
        create: [
          {
            rank: "S",
            name: cards[0].name,
            cardId: cards[0].id,
            quantity: 1,
            remainingQuantity: 1,
            marketPrice: 45000,
            costPrice: 35000,
            sortOrder: 0,
          },
          {
            rank: "A",
            name: cards[1].name,
            cardId: cards[1].id,
            quantity: 5,
            remainingQuantity: 5,
            marketPrice: 12000,
            costPrice: 9000,
            sortOrder: 1,
          },
          {
            rank: "B",
            name: cards[2].name,
            cardId: cards[2].id,
            quantity: 14,
            remainingQuantity: 14,
            marketPrice: 800,
            costPrice: 600,
            sortOrder: 2,
          },
          {
            rank: "LOSE",
            name: "ポイント100pt",
            quantity: 80,
            remainingQuantity: 80,
            marketPrice: 100,
            costPrice: 0,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  await prisma.buylistItem.deleteMany({
    where: { name: { in: ["ピカチュウ SAR", "リザードン ex SR", "151 ボックス", "151 パック"] } },
  });
  await prisma.buylistItem.createMany({
    data: [
      { category: "SAR", name: "ピカチュウ SAR", buyPrice: 35000, condition: "NM" },
      { category: "SR", name: "リザードン ex SR", buyPrice: 9000, condition: "NM" },
      { category: "BOX", name: "151 ボックス", buyPrice: 12000, condition: "未開封" },
      { category: "PACK", name: "151 パック", buyPrice: 600, condition: "未開封" },
    ],
  });

  await prisma.announcement.upsert({
    where: { id: "seed-announcement-001" },
    update: {},
    create: {
      id: "seed-announcement-001",
      title: "ORIPA VAULT オープン",
      body: "オンラインオリパサービスを開始しました。サンプルガチャをお試しください。",
      isActive: true,
    },
  });

  await prisma.banner.upsert({
    where: { id: "seed-banner-001" },
    update: {},
    create: {
      id: "seed-banner-001",
      title: "プレミアムオリパ Vol.1 公開中",
      imageUrl: "https://placehold.co/1200x400/1a1a2e/eab308?text=ORIPA+VAULT",
      linkUrl: "/gacha/seed-gacha-premium-001",
      sortOrder: 0,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "WELCOME100" },
    update: {},
    create: {
      code: "WELCOME100",
      points: 100,
      maxUses: 1000,
      isActive: true,
    },
  });

  const kiriGacha = await prisma.gacha.upsert({
    where: { id: "seed-gacha-kiri-001" },
    update: {},
    create: {
      id: "seed-gacha-kiri-001",
      title: "キリ番&ラストワン 体験オリパ",
      description: "777口キリ番・ラストワン景品付き（サンプル）",
      pricePerPull: 300,
      totalSlots: 50,
      remainingSlots: 50,
      status: "PUBLISHED",
      publishedAt: new Date(),
      kiriNumber: 25,
      minGuaranteeRank: "B",
      noticeText: "キリ番25口目 / ラストワン / 10連B保障",
      prizes: {
        create: [
          {
            rank: "KIRI",
            name: "キリ番賞 スペシャルパック",
            quantity: 1,
            remainingQuantity: 1,
            marketPrice: 5000,
            costPrice: 3000,
            sortOrder: 0,
          },
          {
            rank: "LAST_ONE",
            name: "ラストワン賞 プレミアムBOX",
            quantity: 1,
            remainingQuantity: 1,
            marketPrice: 8000,
            costPrice: 5000,
            sortOrder: 1,
          },
          {
            rank: "A",
            name: cards[1].name,
            cardId: cards[1].id,
            quantity: 3,
            remainingQuantity: 3,
            marketPrice: 12000,
            costPrice: 9000,
            sortOrder: 2,
          },
          {
            rank: "LOSE",
            name: "ポイント50pt",
            quantity: 45,
            remainingQuantity: 45,
            marketPrice: 50,
            costPrice: 0,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  console.log(`Seeded gacha: ${gacha.title} (${gacha.id})`);
  console.log(`Seeded kiri gacha: ${kiriGacha.title} (${kiriGacha.id})`);
  console.log(`Seeded ${cards.length} cards, buylist items, announcement`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

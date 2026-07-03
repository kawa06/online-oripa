import { prisma } from "@/lib/prisma";
import { InventoryManager } from "@/components/admin/InventoryManager";

export default async function AdminInventoryPage() {
  const [cards, priceHistory] = await Promise.all([
    prisma.card.findMany({ orderBy: { updatedAt: "desc" } }).catch(() => []),
    prisma.cardPriceHistory
      .findMany({ orderBy: { changedAt: "desc" }, take: 200 })
      .catch(() => []),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">在庫管理</h1>
      <InventoryManager
        cards={cards}
        priceHistory={priceHistory.map((h) => ({
          ...h,
          changedAt: h.changedAt.toISOString(),
        }))}
      />
    </div>
  );
}

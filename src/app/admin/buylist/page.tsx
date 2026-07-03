import { prisma } from "@/lib/prisma";
import { BuylistManager } from "@/components/admin/BuylistManager";

export default async function AdminBuylistPage() {
  const items = await prisma.buylistItem.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }).catch(() => []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">買取表管理</h1>
      <BuylistManager items={items} />
    </div>
  );
}

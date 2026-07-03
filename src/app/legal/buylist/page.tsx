import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatYen } from "@/lib/utils";
import type { BuylistCategory, BuylistItem } from "@prisma/client";

function categoryLabel(cat: BuylistCategory) {
  const map: Record<BuylistCategory, string> = {
    BOX: "BOX", PACK: "PACK", PSA: "PSA", SAR: "SAR", SR: "SR", AR: "AR", RR: "RR", OTHER: "その他",
  };
  return map[cat];
}

export default async function BuylistPage() {
  const items: BuylistItem[] = await prisma.buylistItem
    .findMany({ where: { isPublished: true }, orderBy: [{ category: "asc" }, { buyPrice: "desc" }] })
    .catch(() => [] as BuylistItem[]);

  const grouped = items.reduce<Record<string, BuylistItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">買取表</h1>
      <p className="mt-2 text-muted">参考買取価格一覧です。価格は在庫状況により変動する場合があります。</p>
      {items.length === 0 ? (
        <div className="card-surface mt-8 p-8 text-center text-muted">公開中の買取情報がありません。</div>
      ) : (
        <div className="mt-8 space-y-8">
          {Object.entries(grouped).map(([category, catItems]) => (
            <section key={category}>
              <h2 className="mb-4 text-lg font-bold gold-text">{categoryLabel(category as BuylistCategory)}</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted">
                      <th className="pb-2 pr-4 font-semibold">カード名</th>
                      <th className="pb-2 pr-4 font-semibold">状態</th>
                      <th className="pb-2 pr-4 font-semibold">買取価格</th>
                      <th className="pb-2 font-semibold">備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map((item) => (
                      <tr key={item.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-medium">{item.name}</td>
                        <td className="py-3 pr-4 text-muted">{item.condition ?? "—"}</td>
                        <td className="py-3 pr-4 font-semibold text-gold">{formatYen(item.buyPrice)}</td>
                        <td className="py-3 text-muted">{item.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
      <Link href="/" className="mt-8 inline-block text-sm text-gold">← トップページ</Link>
    </div>
  );
}

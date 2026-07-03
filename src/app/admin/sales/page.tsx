import { prisma } from "@/lib/prisma";
import { formatPoints } from "@/lib/utils";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default async function AdminSalesPage() {
  const txs = await prisma.pointTransaction
    .findMany({ where: { type: "PURCHASE", amount: { gt: 0 } }, orderBy: { createdAt: "desc" }, take: 100 })
    .catch(() => []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">売上管理</h1>
        <a href="/api/admin/export/sales" className="btn-secondary">CSVエクスポート</a>
      </div>
      <div className="card-surface table-scroll">
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated text-left text-muted">
            <tr><th className="p-3">日時</th><th className="p-3">金額</th><th className="p-3">説明</th></tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id} className="border-t border-border/50">
                <td className="p-3">{format(tx.createdAt, "yyyy/MM/dd HH:mm", { locale: ja })}</td>
                <td className="p-3 text-gold">{formatPoints(tx.amount)}</td>
                <td className="p-3 text-muted">{tx.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

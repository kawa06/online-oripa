import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPoints } from "@/lib/utils";

export default async function AdminGachasPage() {
  const gachas = await prisma.gacha.findMany({ orderBy: { updatedAt: "desc" } }).catch(() => []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">ガチャ管理</h1>
        <Link href="/admin/gachas/new" className="btn-primary">新規作成</Link>
      </div>
      <div className="card-surface table-scroll">
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated text-left text-muted">
            <tr>
              <th className="p-3">タイトル</th>
              <th className="p-3">状態</th>
              <th className="p-3">単価</th>
              <th className="p-3">残り口数</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {gachas.map((g) => (
              <tr key={g.id} className="border-t border-border/50">
                <td className="p-3 font-medium">{g.title}</td>
                <td className="p-3">{g.status}</td>
                <td className="p-3">{formatPoints(g.pricePerPull)}</td>
                <td className="p-3">{g.remainingSlots} / {g.totalSlots}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/gachas/${g.id}`} className="text-gold hover:underline">編集</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

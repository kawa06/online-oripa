import { prisma } from "@/lib/prisma";
import { formatYen } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { detectFraudAlerts } from "@/lib/fraud";
import { startOfDay, startOfMonth, subDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import { SalesChart } from "@/components/admin/SalesChart";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);
  const weekStart = startOfDay(subDays(now, 6));

  const [
    userCount,
    salesToday,
    salesMonth,
    weekSales,
    pendingShipping,
    openInquiries,
    lowStock,
    publishedGachas,
    fraudAlerts,
  ] = await Promise.all([
    prisma.profile.count().catch(() => 0),
    prisma.pointTransaction
      .aggregate({
        where: { type: "PURCHASE", amount: { gt: 0 }, createdAt: { gte: todayStart } },
        _sum: { amount: true },
      })
      .catch(() => ({ _sum: { amount: 0 } })),
    prisma.pointTransaction
      .aggregate({
        where: { type: "PURCHASE", amount: { gt: 0 }, createdAt: { gte: monthStart } },
        _sum: { amount: true },
      })
      .catch(() => ({ _sum: { amount: 0 } })),
    prisma.pointTransaction
      .findMany({
        where: { type: "PURCHASE", amount: { gt: 0 }, createdAt: { gte: weekStart } },
        select: { amount: true, createdAt: true },
      })
      .catch(() => []),
    prisma.shippingRequest.count({ where: { status: { in: ["PENDING", "UNCONFIRMED", "PACKING", "READY"] } } }).catch(() => 0),
    prisma.contactInquiry.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }).catch(() => 0),
    prisma.card.count({ where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD } } }).catch(() => 0),
    prisma.gacha.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
    detectFraudAlerts(5).catch(() => []),
  ]);

  const chartMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = format(subDays(now, 6 - i), "MM/dd");
    chartMap.set(d, 0);
  }
  for (const tx of weekSales) {
    const key = format(tx.createdAt, "MM/dd");
    chartMap.set(key, (chartMap.get(key) ?? 0) + tx.amount);
  }
  const chartData = Array.from(chartMap.entries()).map(([date, sales]) => ({ date, sales }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">ダッシュボード</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-surface p-5">
          <p className="text-sm text-muted">ユーザー数</p>
          <p className="mt-2 text-3xl font-bold">{userCount.toLocaleString()}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-muted">本日の売上</p>
          <p className="mt-2 text-3xl font-bold text-gold">{formatYen(salesToday._sum.amount ?? 0)}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-muted">今月の売上</p>
          <p className="mt-2 text-3xl font-bold text-gold">{formatYen(salesMonth._sum.amount ?? 0)}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-muted">公開中ガチャ</p>
          <p className="mt-2 text-3xl font-bold">{publishedGachas}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-muted">発送待ち</p>
          <p className="mt-2 text-3xl font-bold">{pendingShipping}</p>
          <Link href="/admin/shipping" className="mt-2 inline-block text-xs text-gold">発送管理 →</Link>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-muted">未対応お問い合わせ</p>
          <p className="mt-2 text-3xl font-bold">{openInquiries}</p>
          <Link href="/admin/inquiries" className="mt-2 inline-block text-xs text-gold">確認 →</Link>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-muted">低在庫カード</p>
          <p className={`mt-2 text-3xl font-bold ${lowStock > 0 ? "text-danger" : ""}`}>{lowStock}</p>
          <Link href="/admin/inventory" className="mt-2 inline-block text-xs text-gold">在庫管理 →</Link>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-muted">不正アラート</p>
          <p className={`mt-2 text-3xl font-bold ${fraudAlerts.length > 0 ? "text-danger" : ""}`}>
            {fraudAlerts.length}
          </p>
          <Link href="/admin/fraud" className="mt-2 inline-block text-xs text-gold">詳細 →</Link>
        </div>
      </div>
      <div className="card-surface p-5">
        <h2 className="mb-4 font-bold">直近7日間の売上</h2>
        <SalesChart data={chartData} />
        <p className="mt-2 text-xs text-muted">
          {format(weekStart, "yyyy/M/d", { locale: ja })} 〜 今日
        </p>
      </div>
    </div>
  );
}

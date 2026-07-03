import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getSessionProfile } from "@/lib/auth";
import { formatYen } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import type { PointTxType } from "@prisma/client";

function txLabel(type: PointTxType) {
  const map: Record<PointTxType, string> = {
    PURCHASE: "ポイント購入",
    GACHA: "ガチャ",
    CONVERT: "景品変換",
    ADMIN_GRANT: "管理者付与",
    ADMIN_DEDUCT: "管理者減算",
    LOGIN_BONUS: "ログインボーナス",
    COUPON: "クーポン",
    REFUND: "返金",
  };
  return map[type];
}

export default async function PurchasesPage() {
  const profile = await getSessionProfile().catch(() => null);
  if (!profile) redirect("/login");

  const purchases = await prisma.pointTransaction
    .findMany({ where: { userId: profile.id, type: "PURCHASE" }, orderBy: { createdAt: "desc" } })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">購入履歴</h1>
      <p className="mt-2 text-muted">ポイント購入の履歴です。</p>
      {purchases.length === 0 ? (
        <div className="card-surface mt-8 p-8 text-center text-muted">
          購入履歴がありません。
          <Link href="/points" className="mt-4 block text-gold">ポイントを購入 →</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {purchases.map((tx) => (
            <div key={tx.id} className="card-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{txLabel(tx.type)}</p>
                  {tx.description && <p className="mt-1 text-sm text-muted">{tx.description}</p>}
                  <p className="mt-1 text-xs text-muted">{format(tx.createdAt, "yyyy/MM/dd HH:mm", { locale: ja })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gold">+{formatYen(tx.amount)}</p>
                  <p className="text-xs text-muted">残高 {formatYen(tx.balanceAfter)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Link href="/mypage" className="mt-8 inline-block text-sm text-gold">← マイページ</Link>
    </div>
  );
}

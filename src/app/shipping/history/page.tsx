import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getSessionProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ShippingStatus } from "@prisma/client";

function statusLabel(status: ShippingStatus) {
  const map: Record<ShippingStatus, string> = {
    PENDING: "受付待ち",
    UNCONFIRMED: "未確認",
    PACKING: "梱包中",
    READY: "発送準備完了",
    SHIPPED: "発送済み",
    CONTACTED: "連絡済み",
  };
  return map[status];
}

export default async function ShippingHistoryPage() {
  const profile = await getSessionProfile().catch(() => null);
  if (!profile) redirect("/login");

  const requests = await prisma.shippingRequest
    .findMany({ where: { userId: profile.id }, include: { items: true }, orderBy: { createdAt: "desc" } })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">配送履歴</h1>
      <p className="mt-2 text-muted">発送依頼の状況を確認できます。</p>
      {requests.length === 0 ? (
        <div className="card-surface mt-8 p-8 text-center text-muted">
          配送履歴がありません。
          <Link href="/shipping" className="mt-4 block text-gold">配送依頼する →</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="card-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{statusLabel(req.status)}</p>
                  <p className="mt-1 text-sm text-muted">{req.recipientName} · {req.items.length}点</p>
                  {req.trackingNumber && <p className="mt-1 text-sm">追跡: {req.trackingNumber}</p>}
                  <p className="mt-1 text-xs text-muted">{format(req.createdAt, "yyyy/MM/dd HH:mm", { locale: ja })}</p>
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

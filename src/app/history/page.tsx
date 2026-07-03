import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getSessionProfile } from "@/lib/auth";
import { formatYen } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const profile = await getSessionProfile().catch(() => null);
  if (!profile) redirect("/login");

  const pulls = await prisma.gachaPull
    .findMany({ where: { userId: profile.id }, include: { gacha: true, results: true }, orderBy: { createdAt: "desc" } })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">ガチャ履歴</h1>
      <p className="mt-2 text-muted">これまでの抽選履歴を確認できます。</p>
      {pulls.length === 0 ? (
        <div className="card-surface mt-8 p-8 text-center text-muted">履歴がありません。</div>
      ) : (
        <div className="mt-8 space-y-3">
          {pulls.map((pull) => (
            <Link key={pull.id} href={`/gacha/${pull.gachaId}/result?pullId=${pull.id}`} className="card-surface block p-4 transition hover:border-gold/40">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{pull.gacha.title}</p>
                  <p className="mt-1 text-sm text-muted">{format(pull.createdAt, "yyyy/MM/dd HH:mm", { locale: ja })}</p>
                </div>
                <div className="text-right text-sm">
                  <p>{pull.pullCount}回 · {formatYen(pull.totalCost)}</p>
                  <p className="text-muted">{pull.results.length} 景品</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <Link href="/mypage" className="mt-8 inline-block text-sm text-gold">← マイページ</Link>
    </div>
  );
}

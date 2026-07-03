import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionProfile } from "@/lib/auth";
import { rankLabel } from "@/lib/gacha-utils";
import { ShareResultButton } from "@/components/gacha/ShareResultButton";
import type { PrizeRank } from "@prisma/client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pullId?: string }>;
};

export default async function GachaResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { pullId } = await searchParams;

  if (!pullId) notFound();

  const profile = await getSessionProfile().catch(() => null);
  if (!profile) notFound();

  const pull = await prisma.gachaPull
    .findFirst({
      where: { id: pullId, gachaId: id, userId: profile.id },
      include: {
        gacha: true,
        results: {
          include: {
            gachaPrize: true,
            userWin: true,
          },
          orderBy: { slotNumber: "asc" },
        },
      },
    })
    .catch(() => null);

  if (!pull) notFound();

  const rankOrder: Record<PrizeRank, number> = {
    S: 0,
    A: 1,
    B: 2,
    C: 3,
    KIRI: 4,
    LAST_ONE: 5,
    LOSE: 6,
  };
  const topRank = pull.results.reduce(
    (best, r) => (rankOrder[r.gachaPrize.rank] < rankOrder[best] ? r.gachaPrize.rank : best),
    "LOSE" as PrizeRank
  );
  const shareText = `${pull.gacha.title}で${rankLabel(topRank)}を獲得！`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const topResult = pull.results.find((r) => r.gachaPrize.rank === topRank) ?? pull.results[0];
  const ogImageUrl = `${appUrl}/api/og/result?title=${encodeURIComponent(pull.gacha.title)}&prize=${encodeURIComponent(topResult.gachaPrize.name)}&rank=${encodeURIComponent(rankLabel(topRank))}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">抽選結果</h1>
      <p className="mt-2 text-muted">{pull.gacha.title} — {pull.pullCount}回</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pull.results.map((result) => (
          <div key={result.id} className="card-surface overflow-hidden">
            <div className="flex aspect-[4/3] items-center justify-center bg-bg-elevated">
              {result.gachaPrize.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.gachaPrize.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold gold-text">
                  {rankLabel(result.gachaPrize.rank)}
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-gold">
                {rankLabel(result.gachaPrize.rank)} · #{result.slotNumber}
              </p>
              <p className="mt-1 font-bold">{result.gachaPrize.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ShareResultButton
          title="ORIPA VAULT 抽選結果"
          shareText={shareText}
          url={`${appUrl}/gacha/${id}`}
          ogImageUrl={ogImageUrl}
        />
        <Link href={`/gacha/${id}`} className="btn-primary text-center">
          もう一度引く
        </Link>
        <Link href="/wins" className="btn-secondary text-center">
          獲得景品を見る
        </Link>
        <Link href="/gacha" className="btn-secondary text-center">
          ガチャ一覧
        </Link>
      </div>
    </div>
  );
}

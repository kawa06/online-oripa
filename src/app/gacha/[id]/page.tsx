import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionProfile } from "@/lib/auth";
import { calcGachaMetrics, formatPoints, formatYen } from "@/lib/utils";
import { rankLabel } from "@/lib/gacha-utils";
import { GachaLiveStats } from "@/components/gacha/GachaLiveStats";
import { GachaPurchasePanel } from "./GachaPurchasePanel";

type Props = { params: Promise<{ id: string }> };

export default async function GachaDetailPage({ params }: Props) {
  const { id } = await params;

  const gacha = await prisma.gacha
    .findUnique({
      where: { id, status: "PUBLISHED" },
      include: { prizes: { orderBy: { sortOrder: "asc" } } },
    })
    .catch(() => null);

  if (!gacha) notFound();

  const metrics = calcGachaMetrics(gacha.totalSlots, gacha.pricePerPull, gacha.prizes);
  const soldSlots = gacha.totalSlots - gacha.remainingSlots;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/gacha" className="text-sm text-gold">
        ← ガチャ一覧
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="card-surface overflow-hidden">
          <div className="flex aspect-square items-center justify-center bg-bg-elevated text-muted">
            {gacha.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gacha.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              "ORIPA"
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{gacha.title}</h1>
          {gacha.description && <p className="mt-2 text-muted">{gacha.description}</p>}
          <p className="mt-4 text-xl font-bold text-gold">
            {formatPoints(gacha.pricePerPull)} / 1回
          </p>

          <div className="card-surface mt-4 p-4">
            <h2 className="font-bold">透明性情報</h2>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">総口数</dt>
                <dd className="font-semibold">{gacha.totalSlots.toLocaleString()} 口</dd>
              </div>
              <div>
                <dt className="text-muted">残り口数</dt>
                <dd className="font-semibold text-gold">
                  {gacha.remainingSlots.toLocaleString()} 口
                </dd>
              </div>
              <div>
                <dt className="text-muted">消化口数</dt>
                <dd className="font-semibold">{soldSlots.toLocaleString()} 口</dd>
              </div>
              <div>
                <dt className="text-muted">参考還元率</dt>
                <dd className="font-semibold">{metrics.returnRate.toFixed(1)}%</dd>
              </div>
            </dl>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full bg-gold transition-all"
                style={{
                  width: `${gacha.totalSlots ? (soldSlots / gacha.totalSlots) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <GachaLiveStats gachaId={gacha.id} />

          {(gacha.isDailyOnce || gacha.isFirstTimeOnly || gacha.kiriNumber) && (
            <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm">
              <p className="font-semibold text-gold">注意事項</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted">
                {gacha.isDailyOnce && <li>1日1回限定ガチャです</li>}
                {gacha.isFirstTimeOnly && <li>初回限定ガチャです</li>}
                {gacha.kiriNumber && <li>キリ番: {gacha.kiriNumber} 口目</li>}
              </ul>
            </div>
          )}

          {gacha.noticeText && (
            <div className="mt-4 rounded-xl border border-border bg-bg-card p-4 text-sm text-muted">
              {gacha.noticeText}
            </div>
          )}

          {gacha.minGuaranteeNote && (
            <div className="mt-4 rounded-xl border border-border bg-bg-card p-4 text-sm">
              <p className="font-semibold">最低保証について</p>
              <p className="mt-1 text-muted">{gacha.minGuaranteeNote}</p>
              {gacha.minGuaranteeRank && (
                <p className="mt-2 text-xs text-gold">10連: {gacha.minGuaranteeRank} ランク以上保障</p>
              )}
            </div>
          )}
          {!gacha.minGuaranteeNote && gacha.minGuaranteeRank && (
            <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm">
              <p className="font-semibold text-gold">10連最低保証</p>
              <p className="mt-1 text-muted">{gacha.minGuaranteeRank} ランク以上が1枚以上排出されます</p>
            </div>
          )}

          <GachaPurchasePanel
            gachaId={gacha.id}
            pricePerPull={gacha.pricePerPull}
            remainingSlots={gacha.remainingSlots}
            isDailyOnce={gacha.isDailyOnce}
            isFirstTimeOnly={gacha.isFirstTimeOnly}
          />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold">景品一覧</h2>
        <p className="mt-1 text-sm text-muted">残数 / 総数を公開しています。</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gacha.prizes.map((prize) => (
            <div key={prize.id} className="card-surface flex gap-3 p-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-bg-elevated text-xs text-muted">
                {prize.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={prize.imageUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  rankLabel(prize.rank)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gold">{rankLabel(prize.rank)}</p>
                <p className="truncate font-semibold">{prize.name}</p>
                <p className="mt-1 text-xs text-muted">
                  残 {prize.remainingQuantity} / {prize.quantity}
                </p>
                {prize.marketPrice > 0 && (
                  <p className="text-xs text-muted">参考: {formatYen(prize.marketPrice)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

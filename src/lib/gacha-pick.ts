import "server-only";

import type { GachaPrize, PrizeRank } from "@prisma/client";

const RANK_VALUE: Record<PrizeRank, number> = {
  S: 0,
  A: 1,
  LAST_ONE: 1,
  KIRI: 2,
  B: 2,
  C: 3,
  LOSE: 99,
};

export function meetsMinGuaranteeRank(rank: PrizeRank, minRank: PrizeRank) {
  return RANK_VALUE[rank] <= RANK_VALUE[minRank];
}

export function pickRandomPrize(available: GachaPrize[], preferredRank?: PrizeRank): GachaPrize {
  let pool = available.filter((p) => p.remainingQuantity > 0);
  if (preferredRank) {
    const preferred = pool.filter((p) => p.rank === preferredRank);
    if (preferred.length) pool = preferred;
  }
  if (!pool.length) throw new Error("排出可能な景品がありません");
  const weighted = pool.flatMap((p) => Array(p.remainingQuantity).fill(p));
  return weighted[Math.floor(Math.random() * weighted.length)] as GachaPrize;
}

/** 最低保証ランク以上の景品のみから抽選 */
export function pickGuaranteePrize(available: GachaPrize[], minRank: PrizeRank): GachaPrize {
  const pool = available.filter(
    (p) => p.remainingQuantity > 0 && meetsMinGuaranteeRank(p.rank, minRank)
  );
  if (!pool.length) throw new Error("最低保証を満たす景品がありません");
  const weighted = pool.flatMap((p) => Array(p.remainingQuantity).fill(p));
  return weighted[Math.floor(Math.random() * weighted.length)] as GachaPrize;
}

export function shouldApplyTenPullGuarantee(
  count: number,
  minGuaranteeRank: PrizeRank | null | undefined,
  results: { prize: GachaPrize }[]
) {
  if (count !== 10 || !minGuaranteeRank) return false;
  return !results.some((r) => meetsMinGuaranteeRank(r.prize.rank, minGuaranteeRank));
}

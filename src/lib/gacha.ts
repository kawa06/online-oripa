import "server-only";

import { prisma } from "@/lib/prisma";
import { notifyWin } from "@/lib/notifications";
import { rankLabel } from "@/lib/gacha-utils";
import { getStartOfTodayJST } from "@/lib/utils";
import {
  pickGuaranteePrize,
  pickRandomPrize,
  shouldApplyTenPullGuarantee,
} from "@/lib/gacha-pick";
import type { GachaPrize, PrizeRank } from "@prisma/client";

async function validatePullLimits(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  gachaId: string,
  count: number,
  gacha: { isDailyOnce: boolean; isFirstTimeOnly: boolean }
) {
  if (gacha.isDailyOnce || gacha.isFirstTimeOnly) {
    if (count !== 1) throw new Error("このガチャは1回のみ引けます");
  }

  if (gacha.isDailyOnce) {
    const todayStart = getStartOfTodayJST();
    const todayPulls = await tx.gachaPull.count({
      where: { userId, gachaId, createdAt: { gte: todayStart } },
    });
    if (todayPulls > 0) throw new Error("本日はすでにこのガチャを引いています");
  }

  if (gacha.isFirstTimeOnly) {
    const priorPulls = await tx.gachaPull.count({ where: { userId, gachaId } });
    if (priorPulls > 0) throw new Error("初回限定ガチャは1回のみ引けます");
  }
}

function validateSpecialPrizes(
  prizes: GachaPrize[],
  gacha: { kiriNumber: number | null; totalSlots: number; remainingSlots: number },
  count: number
) {
  const nextSlotStart = gacha.totalSlots - gacha.remainingSlots + 1;
  const nextSlotEnd = nextSlotStart + count - 1;

  if (gacha.kiriNumber && gacha.kiriNumber >= nextSlotStart && gacha.kiriNumber <= nextSlotEnd) {
    const hasKiri = prizes.some((p) => p.rank === "KIRI" && p.remainingQuantity > 0);
    if (!hasKiri) throw new Error("キリ番景品が設定されていません");
  }

  if (nextSlotEnd >= gacha.totalSlots) {
    const hasLastOne = prizes.some((p) => p.rank === "LAST_ONE" && p.remainingQuantity > 0);
    if (!hasLastOne) throw new Error("ラストワン景品が設定されていません");
  }
}

async function applyPrizePick(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  picked: GachaPrize
) {
  await tx.gachaPrize.update({
    where: { id: picked.id },
    data: { remainingQuantity: { decrement: 1 } },
  });

  if (picked.cardId) {
    const card = await tx.card.findUnique({ where: { id: picked.cardId } });
    if (card && card.stockQuantity <= 0) {
      throw new Error(`在庫不足: ${picked.name}`);
    }
    await tx.card.update({
      where: { id: picked.cardId },
      data: { stockQuantity: { decrement: 1 } },
    });
  }
}

export async function pullGacha(userId: string, gachaId: string, count: 1 | 10) {
  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUniqueOrThrow({ where: { id: userId } });
    const gacha = await tx.gacha.findUniqueOrThrow({
      where: { id: gachaId },
      include: { prizes: true },
    });

    if (gacha.status !== "PUBLISHED") throw new Error("このガチャは現在公開されていません");
    if (gacha.remainingSlots < count) throw new Error("残り口数が不足しています");

    await validatePullLimits(tx, userId, gachaId, count, gacha);
    validateSpecialPrizes(gacha.prizes, gacha, count);

    const totalCost = gacha.pricePerPull * count;
    if (profile.points < totalCost) throw new Error("ポイントが不足しています");

    const results: { prize: GachaPrize; slotNumber: number }[] = [];
    let remainingBeforePull = gacha.remainingSlots;

    for (let i = 0; i < count; i++) {
      const slotNumber = gacha.totalSlots - remainingBeforePull + 1;
      remainingBeforePull -= 1;

      const available = await tx.gachaPrize.findMany({
        where: { gachaId, remainingQuantity: { gt: 0 } },
      });
      if (!available.length) throw new Error("排出可能な景品がありません");

      let preferredRank: PrizeRank | undefined;
      if (gacha.kiriNumber && slotNumber === gacha.kiriNumber) {
        preferredRank = "KIRI";
      } else if (remainingBeforePull === 0) {
        preferredRank = "LAST_ONE";
      }

      const needsGuarantee =
        count === 10 &&
        gacha.minGuaranteeRank &&
        i === count - 1 &&
        shouldApplyTenPullGuarantee(count, gacha.minGuaranteeRank, results);

      const picked = needsGuarantee
        ? pickGuaranteePrize(available, gacha.minGuaranteeRank!)
        : pickRandomPrize(available, preferredRank);

      await applyPrizePick(tx, picked);
      results.push({ prize: picked, slotNumber });
    }

    const newPoints = profile.points - totalCost;
    await tx.profile.update({ where: { id: userId }, data: { points: newPoints } });
    await tx.pointTransaction.create({
      data: {
        userId,
        type: "GACHA",
        amount: -totalCost,
        balanceAfter: newPoints,
        description: `${gacha.title} ${count}回`,
      },
    });

    await tx.gacha.update({
      where: { id: gachaId },
      data: { remainingSlots: { decrement: count } },
    });

    const pull = await tx.gachaPull.create({
      data: { userId, gachaId, pullCount: count, totalCost },
    });

    const wins = [];
    for (const r of results) {
      const pullResult = await tx.pullResult.create({
        data: {
          pullId: pull.id,
          gachaPrizeId: r.prize.id,
          slotNumber: r.slotNumber,
        },
      });
      const win = await tx.userWin.create({
        data: {
          userId,
          pullResultId: pullResult.id,
          cardId: r.prize.cardId,
          name: r.prize.name,
          imageUrl: r.prize.imageUrl,
          rank: r.prize.rank,
          pointValue: Math.floor(r.prize.marketPrice * 0.8),
        },
      });
      wins.push(win);
    }

    return { pullId: pull.id, wins, remainingPoints: newPoints };
  });

  for (const win of result.wins) {
    if (["S", "A", "KIRI", "LAST_ONE"].includes(win.rank)) {
      await notifyWin(userId, win.name, rankLabel(win.rank)).catch(() => null);
    }
  }

  return result;
}

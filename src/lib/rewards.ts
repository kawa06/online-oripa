import "server-only";

import { prisma } from "@/lib/prisma";
import { LOGIN_BONUS_POINTS } from "@/lib/constants";
import { getStartOfTodayJST } from "@/lib/utils";

export async function claimLoginBonus(userId: string) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUniqueOrThrow({ where: { id: userId } });
    const todayStart = getStartOfTodayJST();

    if (profile.loginBonusLastAt && profile.loginBonusLastAt >= todayStart) {
      return { claimed: false as const, points: profile.points, bonus: 0 };
    }

    const bonus = LOGIN_BONUS_POINTS;
    const newPoints = profile.points + bonus;

    await tx.profile.update({
      where: { id: userId },
      data: { points: newPoints, loginBonusLastAt: new Date() },
    });
    await tx.pointTransaction.create({
      data: {
        userId,
        type: "LOGIN_BONUS",
        amount: bonus,
        balanceAfter: newPoints,
        description: "ログインボーナス",
      },
    });

    return { claimed: true as const, points: newPoints, bonus };
  });
}

export async function redeemCoupon(userId: string, code: string) {
  return prisma.$transaction(async (tx) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) throw new Error("クーポンコードを入力してください");

    const coupon = await tx.coupon.findUnique({ where: { code: normalized } });
    if (!coupon || !coupon.isActive) throw new Error("無効なクーポンコードです");
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new Error("このクーポンは有効期限切れです");
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new Error("このクーポンは使用上限に達しています");
    }

    const existing = await tx.couponRedemption.findUnique({
      where: { couponId_userId: { couponId: coupon.id, userId } },
    });
    if (existing) throw new Error("このクーポンはすでに使用済みです");

    const profile = await tx.profile.findUniqueOrThrow({ where: { id: userId } });
    const newPoints = profile.points + coupon.points;

    await tx.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });
    await tx.couponRedemption.create({
      data: { couponId: coupon.id, userId },
    });
    await tx.profile.update({ where: { id: userId }, data: { points: newPoints } });
    await tx.pointTransaction.create({
      data: {
        userId,
        type: "COUPON",
        amount: coupon.points,
        balanceAfter: newPoints,
        description: `クーポン: ${coupon.code}`,
      },
    });

    return { points: newPoints, bonus: coupon.points, code: coupon.code };
  });
}

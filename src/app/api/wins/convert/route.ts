import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  winId: z.string().min(1).optional(),
  winIds: z.array(z.string().min(1)).min(1).optional(),
});

export async function POST(req: Request) {
  try {
    const profile = await requireProfile();
    const body = schema.parse(await req.json());
    const ids = body.winIds ?? (body.winId ? [body.winId] : []);
    if (!ids.length) throw new Error("変換する景品を指定してください");

    const result = await prisma.$transaction(async (tx) => {
      const wins = await tx.userWin.findMany({
        where: { id: { in: ids }, userId: profile.id, status: "HELD" },
      });
      if (wins.length !== ids.length) throw new Error("変換可能な景品が見つかりません");

      const totalPoints = wins.reduce((s, w) => s + w.pointValue, 0);
      const updatedProfile = await tx.profile.update({
        where: { id: profile.id },
        data: { points: { increment: totalPoints } },
      });

      await tx.userWin.updateMany({
        where: { id: { in: ids } },
        data: { status: "POINT_CONVERTED" },
      });

      if (wins.length === 1) {
        await tx.pointTransaction.create({
          data: {
            userId: profile.id,
            type: "CONVERT",
            amount: totalPoints,
            balanceAfter: updatedProfile.points,
            description: `${wins[0].name} をポイント変換`,
          },
        });
      } else {
        await tx.pointTransaction.create({
          data: {
            userId: profile.id,
            type: "CONVERT",
            amount: totalPoints,
            balanceAfter: updatedProfile.points,
            description: `${wins.length} 点を一括ポイント変換`,
          },
        });
      }

      return { pointsAdded: totalPoints, remainingPoints: updatedProfile.points, count: wins.length };
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "変換に失敗しました";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

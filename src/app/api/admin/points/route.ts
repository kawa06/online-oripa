import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive(),
  mode: z.enum(["grant", "deduct"]),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { userId, amount, mode, description } = schema.parse(await req.json());

    const result = await prisma.$transaction(async (tx) => {
      const delta = mode === "grant" ? amount : -amount;
      const profile = await tx.profile.findUniqueOrThrow({ where: { id: userId } });
      const newBalance = profile.points + delta;
      if (newBalance < 0) throw new Error("ポイント残高がマイナスになります");

      const updated = await tx.profile.update({
        where: { id: userId },
        data: { points: newBalance },
      });

      await tx.pointTransaction.create({
        data: {
          userId,
          type: mode === "grant" ? "ADMIN_GRANT" : "ADMIN_DEDUCT",
          amount: delta,
          balanceAfter: updated.points,
          description: description ?? (mode === "grant" ? "管理者付与" : "管理者減算"),
        },
      });

      return { points: updated.points };
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "処理に失敗しました";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

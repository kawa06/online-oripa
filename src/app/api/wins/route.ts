import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { WinStatus } from "@prisma/client";

const querySchema = z.object({
  status: z.enum(["HELD", "POINT_CONVERTED", "SHIPPING_REQUESTED", "SHIPPED"]).optional(),
});

export async function GET(req: Request) {
  try {
    const profile = await requireProfile();
    const { searchParams } = new URL(req.url);
    const { status } = querySchema.parse({ status: searchParams.get("status") ?? undefined });

    const wins = await prisma.userWin.findMany({
      where: {
        userId: profile.id,
        ...(status ? { status: status as WinStatus } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        rank: true,
        pointValue: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ wins });
  } catch (err) {
    const message = err instanceof Error ? err.message : "取得に失敗しました";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}

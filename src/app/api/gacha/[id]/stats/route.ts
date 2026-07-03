import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const gacha = await prisma.gacha.findUnique({
      where: { id, status: "PUBLISHED" },
      include: {
        prizes: {
          select: {
            rank: true,
            name: true,
            quantity: true,
            remainingQuantity: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!gacha) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const soldSlots = gacha.totalSlots - gacha.remainingSlots;
    return NextResponse.json({
      id: gacha.id,
      remainingSlots: gacha.remainingSlots,
      totalSlots: gacha.totalSlots,
      soldSlots,
      soldPercent: gacha.totalSlots ? (soldSlots / gacha.totalSlots) * 100 : 0,
      prizes: gacha.prizes,
      updatedAt: gacha.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

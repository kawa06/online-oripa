import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ code: z.string().min(1) });

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { code } = schema.parse(await req.json());
    const normalized = code.trim().toUpperCase();

    const byShipping = await prisma.shippingRequest.findFirst({
      where: { shippingBarcode: normalized },
      include: {
        user: { select: { email: true } },
        items: { include: { userWin: { select: { name: true, rank: true } } } },
      },
    });

    const byBox = await prisma.shippingRequest.findFirst({
      where: { boxBarcode: normalized },
      include: {
        user: { select: { email: true } },
        items: { include: { userWin: { select: { name: true, rank: true } } } },
      },
    });

    const byItem = await prisma.shippingRequestItem.findFirst({
      where: { barcode: normalized },
      include: {
        shippingRequest: {
          include: {
            user: { select: { email: true } },
            items: { include: { userWin: { select: { name: true, rank: true } } } },
          },
        },
      },
    });

    const request = byShipping ?? byBox ?? byItem?.shippingRequest ?? null;
    const matchType = byShipping ? "shipping" : byBox ? "box" : byItem ? "item" : null;

    if (!request) {
      return NextResponse.json({ found: false });
    }

    const mismatch =
      (byShipping && byBox && byShipping.id !== byBox.id) ||
      (byShipping && !byBox && !!request.boxBarcode) ||
      (byBox && !byShipping && !!request.shippingBarcode);

    return NextResponse.json({
      found: true,
      matchType,
      mismatch,
      request,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "検索に失敗しました";
    return NextResponse.json({ error: message }, { status: message === "Forbidden" ? 403 : 400 });
  }
}

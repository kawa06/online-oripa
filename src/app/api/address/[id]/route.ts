import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
  label: z.string().min(1).default("自宅"),
  postalCode: z.string().min(1),
  prefecture: z.string().min(1),
  city: z.string().min(1),
  addressLine: z.string().min(1),
  building: z.string().optional(),
  phone: z.string().min(1),
  recipientName: z.string().min(1),
  isDefault: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const profile = await requireProfile();
    const { id } = await params;
    const data = addressSchema.parse(await req.json());

    const existing = await prisma.userAddress.findFirst({ where: { id, userId: profile.id } });
    if (!existing) return NextResponse.json({ error: "住所が見つかりません" }, { status: 404 });

    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.userAddress.updateMany({
          where: { userId: profile.id, NOT: { id } },
          data: { isDefault: false },
        });
      }
      return tx.userAddress.update({
        where: { id },
        data: {
          label: data.label,
          postalCode: data.postalCode,
          prefecture: data.prefecture,
          city: data.city,
          addressLine: data.addressLine,
          building: data.building || null,
          phone: data.phone,
          recipientName: data.recipientName,
          isDefault: data.isDefault ?? existing.isDefault,
        },
      });
    });

    return NextResponse.json({ address });
  } catch (err) {
    const message = err instanceof Error ? err.message : "更新に失敗しました";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const profile = await requireProfile();
    const { id } = await params;

    const existing = await prisma.userAddress.findFirst({ where: { id, userId: profile.id } });
    if (!existing) return NextResponse.json({ error: "住所が見つかりません" }, { status: 404 });

    await prisma.userAddress.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "削除に失敗しました";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}

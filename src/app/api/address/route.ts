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

export async function GET() {
  try {
    const profile = await requireProfile();
    const addresses = await prisma.userAddress.findMany({
      where: { userId: profile.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ addresses });
  } catch (err) {
    const message = err instanceof Error ? err.message : "取得に失敗しました";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await requireProfile();
    const data = addressSchema.parse(await req.json());

    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.userAddress.updateMany({
          where: { userId: profile.id },
          data: { isDefault: false },
        });
      }
      return tx.userAddress.create({
        data: {
          userId: profile.id,
          label: data.label,
          postalCode: data.postalCode,
          prefecture: data.prefecture,
          city: data.city,
          addressLine: data.addressLine,
          building: data.building || null,
          phone: data.phone,
          recipientName: data.recipientName,
          isDefault: data.isDefault ?? false,
        },
      });
    });

    return NextResponse.json({ address });
  } catch (err) {
    const message = err instanceof Error ? err.message : "保存に失敗しました";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}

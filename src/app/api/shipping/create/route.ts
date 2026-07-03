import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { createShippingRequest } from "@/lib/shipping";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  winIds: z.array(z.string().min(1)).min(1),
  recipientName: z.string().min(1),
  phone: z.string().min(1),
  postalCode: z.string().min(1),
  prefecture: z.string().min(1),
  city: z.string().min(1),
  addressLine: z.string().min(1),
  building: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const profile = await requireProfile();
    const data = schema.parse(await req.json());

    const result = await createShippingRequest({
      userId: profile.id,
      winIds: data.winIds,
      address: {
        recipientName: data.recipientName,
        phone: data.phone,
        postalCode: data.postalCode,
        prefecture: data.prefecture,
        city: data.city,
        addressLine: data.addressLine,
        building: data.building,
      },
    });

    await createNotification({
      userId: profile.id,
      title: "発送依頼を受け付けました",
      body: `${data.winIds.length} 点の景品の発送依頼を受け付けました。`,
      linkUrl: "/shipping/history",
    }).catch(() => null);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "発送依頼の作成に失敗しました";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

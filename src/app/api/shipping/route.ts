import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { createShippingFromAddressId } from "@/lib/shipping";

const schema = z.object({
  winIds: z.array(z.string().min(1)).min(1),
  addressId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const profile = await requireProfile();
    const data = schema.parse(await req.json());
    const result = await createShippingFromAddressId(profile.id, data.winIds, data.addressId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "発送依頼の作成に失敗しました";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

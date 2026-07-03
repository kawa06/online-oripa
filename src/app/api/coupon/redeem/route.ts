import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { redeemCoupon } from "@/lib/rewards";

const schema = z.object({ code: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const profile = await requireProfile();
    const { code } = schema.parse(await req.json());
    const result = await redeemCoupon(profile.id, code);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "クーポンの使用に失敗しました";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

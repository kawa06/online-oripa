import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { pullGacha } from "@/lib/gacha";

const schema = z.object({
  gachaId: z.string().min(1),
  count: z.union([z.literal(1), z.literal(10)]),
});

export async function POST(req: Request) {
  try {
    const profile = await requireProfile();
    const body = schema.parse(await req.json());
    const result = await pullGacha(profile.id, body.gachaId, body.count);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "ガチャに失敗しました";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}


import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth";
import { claimLoginBonus } from "@/lib/rewards";

export async function POST() {
  try {
    const profile = await requireProfile();
    const result = await claimLoginBonus(profile.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "ボーナスの取得に失敗しました";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

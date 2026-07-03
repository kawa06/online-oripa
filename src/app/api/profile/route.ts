import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ phone: z.string().min(1).max(20) });

export async function PATCH(req: Request) {
  try {
    const profile = await requireProfile();
    const { phone } = schema.parse(await req.json());
    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: { phone },
    });
    return NextResponse.json({ phone: updated.phone });
  } catch (err) {
    const message = err instanceof Error ? err.message : "更新に失敗しました";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}

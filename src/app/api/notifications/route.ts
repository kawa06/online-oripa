import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profile = await requireProfile();
    const notifications = await prisma.notification.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: profile.id, isRead: false },
    });
    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "取得に失敗しました";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const profile = await requireProfile();
    const { id, markAllRead } = await req.json();

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: profile.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ ok: true });
    }

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: profile.id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "更新に失敗しました";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHIPPING_STATUSES } from "@/lib/constants";
import { notifyShippingUpdate } from "@/lib/notifications";
import { sendShippingStatusEmail } from "@/lib/email";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(SHIPPING_STATUSES),
  trackingNumber: z.string().optional(),
  adminMemo: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = schema.parse(await req.json());

    const before = await prisma.shippingRequest.findUnique({
      where: { id: data.id },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!before) throw new Error("発送依頼が見つかりません");

    const updated = await prisma.shippingRequest.update({
      where: { id: data.id },
      data: {
        status: data.status,
        trackingNumber: data.trackingNumber,
        adminMemo: data.adminMemo,
      },
    });

    if (data.status === "SHIPPED") {
      const items = await prisma.shippingRequestItem.findMany({
        where: { shippingRequestId: data.id },
      });
      await prisma.userWin.updateMany({
        where: { id: { in: items.map((i) => i.userWinId) } },
        data: { status: "SHIPPED" },
      });
    }

    if (before.status !== data.status) {
      await notifyShippingUpdate(before.user.id, data.status).catch(() => null);
      if (["PACKING", "READY", "SHIPPED", "CONTACTED"].includes(data.status)) {
        await sendShippingStatusEmail({
          to: before.user.email,
          recipientName: before.recipientName,
          status: data.status,
          trackingNumber: data.trackingNumber ?? updated.trackingNumber,
        }).catch(() => null);
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "更新に失敗しました";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

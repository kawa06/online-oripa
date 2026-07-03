import "server-only";

import { prisma } from "@/lib/prisma";

export async function createNotification(params: {
  userId: string;
  title: string;
  body: string;
  linkUrl?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      body: params.body,
      linkUrl: params.linkUrl,
    },
  });
}

export async function notifyShippingUpdate(userId: string, status: string) {
  const labels: Record<string, string> = {
    PACKING: "梱包を開始しました",
    READY: "発送準備が完了しました",
    SHIPPED: "商品を発送しました",
    CONTACTED: "発送に関する連絡を行いました",
  };
  const body = labels[status];
  if (!body) return null;

  return createNotification({
    userId,
    title: "発送状況の更新",
    body,
    linkUrl: "/shipping/history",
  });
}

export async function notifyWin(userId: string, prizeName: string, rank: string) {
  return createNotification({
    userId,
    title: "ガチャ当選",
    body: `${rank}賞「${prizeName}」を獲得しました！`,
    linkUrl: "/wins",
  });
}

import "server-only";

import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/utils";
import { createNotification } from "@/lib/notifications";

export async function createShippingRequest(params: {
  userId: string;
  winIds: string[];
  address: {
    recipientName: string;
    phone: string;
    postalCode: string;
    prefecture: string;
    city: string;
    addressLine: string;
    building?: string | null;
  };
}) {
  return prisma.$transaction(async (tx) => {
    const wins = await tx.userWin.findMany({
      where: {
        id: { in: params.winIds },
        userId: params.userId,
        status: "HELD",
      },
      include: { card: true },
    });

    if (wins.length !== params.winIds.length) {
      throw new Error("発送可能な景品が見つかりません");
    }

    for (const win of wins) {
      if (win.cardId) {
        const card = await tx.card.findUnique({ where: { id: win.cardId } });
        if (card && card.stockQuantity <= 0) {
          throw new Error(`在庫不足: ${win.name}`);
        }
      }
    }

    const shipping = await tx.shippingRequest.create({
      data: {
        userId: params.userId,
        status: "UNCONFIRMED",
        recipientName: params.address.recipientName,
        phone: params.address.phone,
        postalCode: params.address.postalCode,
        prefecture: params.address.prefecture,
        city: params.address.city,
        addressLine: params.address.addressLine,
        building: params.address.building,
        boxBarcode: generateCode("BOX"),
        shippingBarcode: generateCode("SHP"),
        items: {
          create: wins.map((w) => ({
            userWinId: w.id,
            managementCode: w.card?.managementCode ?? generateCode("MG"),
            barcode: w.card?.barcode ?? generateCode("BC"),
          })),
        },
      },
      include: { items: true },
    });

    await tx.userWin.updateMany({
      where: { id: { in: params.winIds } },
      data: { status: "SHIPPING_REQUESTED" },
    });

    for (const win of wins) {
      if (win.cardId) {
        await tx.card.update({
          where: { id: win.cardId },
          data: { stockQuantity: { decrement: 1 } },
        });
      }
    }

    return shipping;
  });
}

export async function createShippingFromAddressId(userId: string, winIds: string[], addressId: string) {
  const address = await prisma.userAddress.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new Error("配送先が見つかりません");

  const shipping = await createShippingRequest({
    userId,
    winIds,
    address: {
      recipientName: address.recipientName,
      phone: address.phone,
      postalCode: address.postalCode,
      prefecture: address.prefecture,
      city: address.city,
      addressLine: address.addressLine,
      building: address.building,
    },
  });

  await createNotification({
    userId,
    title: "発送依頼を受け付けました",
    body: `${winIds.length} 点の景品の発送依頼を受け付けました。`,
    linkUrl: "/shipping/history",
  }).catch(() => null);

  return shipping;
}

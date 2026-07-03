"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { generateCode } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import type {
  BuylistCategory,
  GachaStatus,
  InquiryStatus,
  PrizeRank,
  ShippingStatus,
} from "@prisma/client";

export async function createGacha(data: {
  title: string;
  description?: string;
  imageUrl?: string;
  pricePerPull: number;
  totalSlots: number;
  isDailyOnce?: boolean;
  isFirstTimeOnly?: boolean;
  kiriNumber?: number | null;
  minGuaranteeRank?: PrizeRank | null;
  minGuaranteeNote?: string;
  prizes: {
    rank: PrizeRank;
    name: string;
    quantity: number;
    marketPrice: number;
    costPrice: number;
    cardId?: string;
    imageUrl?: string;
  }[];
}) {
  await requireAdmin();
  const gacha = await prisma.gacha.create({
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      pricePerPull: data.pricePerPull,
      totalSlots: data.totalSlots,
      remainingSlots: data.totalSlots,
      isDailyOnce: data.isDailyOnce ?? false,
      isFirstTimeOnly: data.isFirstTimeOnly ?? false,
      kiriNumber: data.kiriNumber ?? null,
      minGuaranteeRank: data.minGuaranteeRank ?? null,
      minGuaranteeNote: data.minGuaranteeNote,
      prizes: {
        create: data.prizes.map((p, i) => ({
          rank: p.rank,
          name: p.name,
          quantity: p.quantity,
          remainingQuantity: p.quantity,
          marketPrice: p.marketPrice,
          costPrice: p.costPrice,
          cardId: p.cardId || null,
          imageUrl: p.imageUrl,
          sortOrder: i,
        })),
      },
    },
  });
  revalidatePath("/admin/gachas");
  return gacha.id;
}

export async function updateGacha(
  id: string,
  data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    pricePerPull?: number;
    status?: GachaStatus;
    noticeText?: string;
    isDailyOnce?: boolean;
    isFirstTimeOnly?: boolean;
    kiriNumber?: number | null;
    minGuaranteeRank?: PrizeRank | null;
    minGuaranteeNote?: string;
  }
) {
  await requireAdmin();
  const update: Record<string, unknown> = { ...data };
  if (data.status === "PUBLISHED") {
    update.publishedAt = new Date();
  }
  await prisma.gacha.update({ where: { id }, data: update });
  revalidatePath(`/admin/gachas/${id}`);
  revalidatePath("/admin/gachas");
}

export async function addGachaPrize(
  gachaId: string,
  prize: {
    rank: PrizeRank;
    name: string;
    quantity: number;
    marketPrice: number;
    costPrice: number;
    cardId?: string;
  }
) {
  await requireAdmin();
  await prisma.gachaPrize.create({
    data: {
      gachaId,
      rank: prize.rank,
      name: prize.name,
      quantity: prize.quantity,
      remainingQuantity: prize.quantity,
      marketPrice: prize.marketPrice,
      costPrice: prize.costPrice,
      cardId: prize.cardId || null,
    },
  });
  revalidatePath(`/admin/gachas/${gachaId}`);
}

export async function deleteGachaPrize(prizeId: string, gachaId: string) {
  await requireAdmin();
  await prisma.gachaPrize.delete({ where: { id: prizeId } });
  revalidatePath(`/admin/gachas/${gachaId}`);
}

export async function upsertCard(data: {
  id?: string;
  name: string;
  category?: string;
  condition?: string;
  rank?: PrizeRank;
  imageUrl?: string;
  stockQuantity: number;
  marketPrice: number;
  buyPrice: number;
  sellPrice: number;
}) {
  await requireAdmin();
  if (data.id) {
    const existing = await prisma.card.findUnique({ where: { id: data.id } });
    await prisma.card.update({
      where: { id: data.id },
      data: {
        name: data.name,
        category: data.category,
        condition: data.condition,
        rank: data.rank,
        imageUrl: data.imageUrl,
        stockQuantity: data.stockQuantity,
        marketPrice: data.marketPrice,
        buyPrice: data.buyPrice,
        sellPrice: data.sellPrice,
      },
    });
    if (
      existing &&
      (existing.marketPrice !== data.marketPrice ||
        existing.buyPrice !== data.buyPrice ||
        existing.sellPrice !== data.sellPrice)
    ) {
      await prisma.cardPriceHistory.create({
        data: {
          cardId: data.id,
          marketPrice: data.marketPrice,
          buyPrice: data.buyPrice,
          sellPrice: data.sellPrice,
          note: "管理画面から更新",
        },
      });
    }
  } else {
    const code = generateCode("MG");
    const barcode = generateCode("BC");
    await prisma.card.create({
      data: {
        name: data.name,
        category: data.category,
        condition: data.condition,
        rank: data.rank,
        imageUrl: data.imageUrl,
        stockQuantity: data.stockQuantity,
        marketPrice: data.marketPrice,
        buyPrice: data.buyPrice,
        sellPrice: data.sellPrice,
        managementCode: code,
        barcode,
      },
    });
  }
  revalidatePath("/admin/inventory");
}

export async function deleteCard(id: string) {
  await requireAdmin();
  await prisma.card.delete({ where: { id } });
  revalidatePath("/admin/inventory");
}

export async function upsertBuylistItem(data: {
  id?: string;
  category: BuylistCategory;
  name: string;
  condition?: string;
  buyPrice: number;
  note?: string;
  imageUrl?: string;
  isPublished?: boolean;
}) {
  await requireAdmin();
  const payload = {
    category: data.category,
    name: data.name,
    condition: data.condition,
    buyPrice: data.buyPrice,
    note: data.note,
    imageUrl: data.imageUrl || null,
    isPublished: data.isPublished ?? true,
  };
  if (data.id) {
    await prisma.buylistItem.update({
      where: { id: data.id },
      data: payload,
    });
  } else {
    await prisma.buylistItem.create({
      data: payload,
    });
  }
  revalidatePath("/admin/buylist");
  revalidatePath("/legal/buylist");
}

export async function deleteBuylistItem(id: string) {
  await requireAdmin();
  await prisma.buylistItem.delete({ where: { id } });
  revalidatePath("/admin/buylist");
  revalidatePath("/legal/buylist");
}

export async function updateUserMemo(userId: string, adminMemo: string) {
  await requireAdmin();
  await prisma.profile.update({ where: { id: userId }, data: { adminMemo } });
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
  adminReply?: string
) {
  await requireAdmin();
  const inquiry = await prisma.contactInquiry.update({
    where: { id },
    data: {
      status,
      ...(adminReply !== undefined ? { adminReply } : {}),
    },
  });
  revalidatePath("/admin/inquiries");

  const { sendInquiryStatusEmail } = await import("@/lib/email");
  await sendInquiryStatusEmail({
    to: inquiry.email,
    name: inquiry.name,
    subject: inquiry.subject,
    status: inquiry.status,
    adminReply: inquiry.adminReply ?? undefined,
  }).catch(() => null);
}

export async function upsertBanner(data: {
  id?: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  await requireAdmin();
  if (data.id) {
    await prisma.banner.update({
      where: { id: data.id },
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  } else {
    await prisma.banner.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function upsertAnnouncement(data: {
  id?: string;
  title: string;
  body: string;
  isActive?: boolean;
}) {
  await requireAdmin();
  if (data.id) {
    await prisma.announcement.update({
      where: { id: data.id },
      data: { title: data.title, body: data.body, isActive: data.isActive ?? true },
    });
  } else {
    await prisma.announcement.create({
      data: { title: data.title, body: data.body, isActive: data.isActive ?? true },
    });
  }
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function upsertCoupon(data: {
  id?: string;
  code: string;
  points: number;
  maxUses?: number | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}) {
  await requireAdmin();
  const payload = {
    code: data.code.trim().toUpperCase(),
    points: data.points,
    maxUses: data.maxUses ?? null,
    expiresAt: data.expiresAt ?? null,
    isActive: data.isActive ?? true,
  };
  if (data.id) {
    await prisma.coupon.update({ where: { id: data.id }, data: payload });
  } else {
    await prisma.coupon.create({ data: payload });
  }
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}


import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GachaEditForm } from "@/components/admin/GachaEditForm";

export default async function AdminGachaEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [gacha, cards] = await Promise.all([
    prisma.gacha.findUnique({
      where: { id },
      include: { prizes: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.card.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, barcode: true } }).catch(() => []),
  ]);
  if (!gacha) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">ガチャ編集</h1>
      <GachaEditForm gacha={gacha} prizes={gacha.prizes} cards={cards} />
    </div>
  );
}

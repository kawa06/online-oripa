import { prisma } from "@/lib/prisma";
import { GachaCreateForm } from "@/components/admin/GachaCreateForm";

export default async function NewGachaPage() {
  const cards = await prisma.card
    .findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, barcode: true } })
    .catch(() => []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">ガチャ新規作成</h1>
      <GachaCreateForm cards={cards} />
    </div>
  );
}

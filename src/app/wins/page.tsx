import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WinsListClient } from "@/components/wins/WinsListClient";

export default async function WinsPage() {
  const profile = await getSessionProfile().catch(() => null);
  if (!profile) redirect("/login");

  const wins = await prisma.userWin
    .findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">当選アイテム</h1>
      <p className="mt-2 text-muted">保有中の景品をポイント変換または発送依頼できます。</p>

      <WinsListClient
        wins={wins.map((w) => ({
          ...w,
          createdAt: w.createdAt.toISOString(),
        }))}
      />

      <Link href="/mypage" className="mt-8 inline-block text-sm text-gold">
        ← マイページ
      </Link>
    </div>
  );
}

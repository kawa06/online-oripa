import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatYen } from "@/lib/utils";

export default async function GachaListPage() {
  const gachas = await prisma.gacha
    .findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">ガチャ一覧</h1>
      <p className="mt-2 text-muted">公開中のオリパを一覧で確認できます。</p>

      {gachas.length === 0 ? (
        <div className="card-surface mt-8 p-8 text-center text-muted">
          現在公開中のガチャはありません。
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gachas.map((g) => (
            <Link
              key={g.id}
              href={`/gacha/${g.id}`}
              className="card-surface overflow-hidden transition hover:border-gold/40"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-bg-elevated text-muted">
                {g.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  "ORIPA"
                )}
              </div>
              <div className="p-4">
                <h2 className="font-bold">{g.title}</h2>
                {g.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>
                )}
                <p className="mt-3 font-semibold text-gold">
                  {formatYen(g.pricePerPull)} / 1回
                </p>
                <p className="mt-1 text-xs text-muted">
                  残り {g.remainingSlots.toLocaleString()} / {g.totalSlots.toLocaleString()} 口
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

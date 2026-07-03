import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatYen } from "@/lib/utils";

export default async function HomePage() {
  const [gachas, announcements, banners] = await Promise.all([
    prisma.gacha
      .findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 6,
      })
      .catch(() => []),
    prisma.announcement
      .findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      })
      .catch(() => []),
    prisma.banner
      .findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 5,
      })
      .catch(() => []),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-gold">Premium Online Oripa</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
            カードショップ品質の
            <span className="gold-text"> オンラインオリパ</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            透明性の高い排出管理、スマホ最適UI、強力な発送・在庫・買取管理を一体化。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gacha" className="btn-primary">
              ガチャを見る
            </Link>
            <Link href="/legal/buylist" className="btn-secondary">
              買取表
            </Link>
          </div>
        </div>
      </section>

      {banners.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {banners.map((b) => {
              const inner = (
                <div className="card-surface overflow-hidden transition hover:border-gold/40">
                  <div className="aspect-[21/9] bg-bg-elevated">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />
                  </div>
                  <p className="p-3 text-sm font-semibold">{b.title}</p>
                </div>
              );
              return b.linkUrl ? (
                <Link key={b.id} href={b.linkUrl}>{inner}</Link>
              ) : (
                <div key={b.id}>{inner}</div>
              );
            })}
          </div>
        </section>
      )}

      {announcements.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="mb-4 text-lg font-bold">お知らせ</h2>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="card-surface p-4">
                <p className="font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-muted line-clamp-2">{a.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">人気ガチャ</h2>
          <Link href="/gacha" className="text-sm text-gold">
            すべて見る →
          </Link>
        </div>
        {gachas.length === 0 ? (
          <div className="card-surface p-8 text-center text-muted">
            公開中のガチャがありません。管理画面から作成してください。
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gachas.map((g) => (
              <Link
                key={g.id}
                href={`/gacha/${g.id}`}
                className="card-surface overflow-hidden transition hover:border-gold/40"
              >
                <div className="aspect-[4/3] bg-bg-elevated flex items-center justify-center text-muted">
                  {g.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    "ORIPA"
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{g.title}</h3>
                  <p className="mt-2 text-gold font-semibold">{formatYen(g.pricePerPull)} / 1回</p>
                  <p className="mt-1 text-xs text-muted">
                    残り {g.remainingSlots.toLocaleString()} / {g.totalSlots.toLocaleString()} 口
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

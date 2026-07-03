"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { rankLabel } from "@/lib/gacha-utils";
import type { EffectRank } from "@/lib/gacha/rankEffects";
import { formatPoints } from "@/lib/utils";

export type PullResultItem = {
  winId: string;
  rank: string;
  name: string;
  imageUrl: string | null;
  pointValue: number;
  slotNumber?: number;
};

export function ResultRevealPanel({
  gachaId,
  results,
  topRank,
}: {
  gachaId: string;
  results: PullResultItem[];
  topRank: EffectRank;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const winIds = results.map((r) => r.winId).join(",");

  async function sellWin(winId: string, pointValue: number) {
    if (!confirm(`この景品を${formatPoints(pointValue)}相当でポイントに変換しますか？`)) return;
    setLoadingId(winId);
    setError("");
    const res = await fetch("/api/wins/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winIds: [winId] }),
    });
    const data = await res.json();
    setLoadingId(null);
    if (!res.ok) {
      setError(data.error ?? "売却に失敗しました");
      return;
    }
    window.location.reload();
  }

  return (
    <motion.div
      className="mx-auto w-full max-w-4xl px-4 py-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-center text-2xl font-bold md:text-3xl">
        <span className="gold-text">{rankLabel(topRank)}</span> 獲得！
      </h2>
      <p className="mt-2 text-center text-sm text-muted">{results.length}件の結果</p>

      {error && <p className="mt-4 text-center text-sm text-danger">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {results.map((r, i) => (
          <motion.div
            key={r.winId}
            className="card-surface overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex aspect-[4/3] items-center justify-center bg-bg-elevated">
              {r.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.imageUrl} alt={r.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold gold-text">{rankLabel(r.rank)}</span>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-gold">{rankLabel(r.rank)}</p>
              <p className="mt-1 font-bold">{r.name}</p>
              <p className="mt-1 text-xs text-muted">売却: {formatPoints(r.pointValue)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/shipping?winIds=${r.winId}`} className="btn-primary text-xs">
                  発送する
                </Link>
                <Link href="/wins" className="btn-secondary text-xs">
                  保管する
                </Link>
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  disabled={loadingId === r.winId}
                  onClick={() => sellWin(r.winId, r.pointValue)}
                >
                  {loadingId === r.winId ? "処理中..." : "売却する"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {results.length > 1 && (
          <Link href={`/shipping?winIds=${winIds}`} className="btn-primary text-center">
            まとめて発送する
          </Link>
        )}
        <Link href={`/gacha/${gachaId}`} className="btn-secondary text-center">
          もう一度引く
        </Link>
        <Link href="/wins" className="btn-secondary text-center">
          獲得景品一覧
        </Link>
      </div>
    </motion.div>
  );
}

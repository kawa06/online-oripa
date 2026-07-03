"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useState } from "react";
import { rankLabel } from "@/lib/gacha-utils";
import { WinRowActions } from "@/app/wins/WinRowActions";
import type { PrizeRank, WinStatus } from "@prisma/client";

type Win = {
  id: string;
  name: string;
  imageUrl: string | null;
  rank: PrizeRank;
  pointValue: number;
  status: WinStatus;
  createdAt: string;
};

function statusLabel(status: WinStatus) {
  const map: Record<WinStatus, string> = {
    HELD: "保有中",
    POINT_CONVERTED: "ポイント変換済",
    SHIPPING_REQUESTED: "発送依頼中",
    SHIPPED: "発送済",
  };
  return map[status];
}

export function WinsListClient({ wins }: { wins: Win[] }) {
  const held = wins.filter((w) => w.status === "HELD");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function bulkConvert() {
    if (!selected.length) return;
    if (!confirm(`${selected.length} 点をポイントに変換しますか？`)) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/wins/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winIds: selected }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "変換に失敗しました");
      return;
    }
    window.location.reload();
  }

  if (wins.length === 0) {
    return (
      <div className="card-surface mt-8 p-8 text-center text-muted">
        当選アイテムがありません。
        <Link href="/gacha" className="mt-4 block text-gold">
          ガチャを引く →
        </Link>
      </div>
    );
  }

  return (
    <>
      {held.length > 0 && (
        <div className="card-surface mt-6 flex flex-wrap items-center gap-3 p-4">
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => setSelected(selected.length === held.length ? [] : held.map((w) => w.id))}
          >
            {selected.length === held.length ? "選択解除" : "保有中をすべて選択"}
          </button>
          <button
            type="button"
            className="btn-primary text-xs"
            disabled={loading || selected.length === 0}
            onClick={bulkConvert}
          >
            {loading ? "処理中..." : `一括ポイント変換 (${selected.length})`}
          </button>
          <a
            href={selected.length ? `/shipping?winIds=${selected.join(",")}` : "#"}
            className={`btn-secondary text-xs ${selected.length === 0 ? "pointer-events-none opacity-45" : ""}`}
          >
            一括発送依頼
          </a>
          {error && <p className="w-full text-sm text-danger">{error}</p>}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {wins.map((win) => (
          <div
            key={win.id}
            className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-4">
              {win.status === "HELD" && (
                <input
                  type="checkbox"
                  checked={selected.includes(win.id)}
                  onChange={() => toggle(win.id)}
                />
              )}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-bg-elevated text-xs">
                {win.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={win.imageUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  rankLabel(win.rank)
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gold">{rankLabel(win.rank)}</p>
                <p className="font-bold">{win.name}</p>
                <p className="text-sm text-muted">
                  変換 ¥{win.pointValue.toLocaleString("ja-JP")} · {statusLabel(win.status)}
                </p>
                <p className="text-xs text-muted">
                  {format(new Date(win.createdAt), "yyyy/MM/dd HH:mm", { locale: ja })}
                </p>
              </div>
            </div>
            <WinRowActions win={win} />
          </div>
        ))}
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { rankLabel } from "@/lib/gacha-utils";
import type { PrizeRank } from "@prisma/client";

type PrizeStat = {
  rank: PrizeRank;
  name: string;
  quantity: number;
  remainingQuantity: number;
};

type Stats = {
  remainingSlots: number;
  totalSlots: number;
  soldSlots: number;
  soldPercent: number;
  prizes: PrizeStat[];
};

export function GachaLiveStats({ gachaId }: { gachaId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const res = await fetch(`/api/gacha/${gachaId}/stats`);
      if (!res.ok) return;
      const data = await res.json();
      if (active) setStats(data);
    }

    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [gachaId]);

  if (!stats) return null;

  return (
    <div className="card-surface mt-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">リアルタイム残数</h2>
        <span className="text-xs text-success">● 5秒更新</span>
      </div>
      <p className="mt-2 text-sm text-muted">
        残り {stats.remainingSlots.toLocaleString()} / {stats.totalSlots.toLocaleString()} 口
        （{stats.soldPercent.toFixed(1)}% 消化）
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-elevated">
        <div className="h-full bg-gold transition-all" style={{ width: `${stats.soldPercent}%` }} />
      </div>
      <div className="mt-4 space-y-2">
        {stats.prizes.map((p, i) => (
          <div key={`${p.rank}-${i}`} className="flex items-center justify-between text-sm">
            <span>
              <span className="text-gold">{rankLabel(p.rank)}</span> {p.name}
            </span>
            <span className="text-muted">
              {p.remainingQuantity} / {p.quantity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

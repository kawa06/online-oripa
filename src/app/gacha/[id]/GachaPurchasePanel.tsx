"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPoints } from "@/lib/utils";

type Props = {
  gachaId: string;
  pricePerPull: number;
  remainingSlots: number;
  isDailyOnce?: boolean;
  isFirstTimeOnly?: boolean;
};

export function GachaPurchasePanel({
  gachaId,
  pricePerPull,
  remainingSlots,
  isDailyOnce = false,
  isFirstTimeOnly = false,
}: Props) {
  const [agreed, setAgreed] = useState(false);
  const singleOnly = isDailyOnce || isFirstTimeOnly;
  const canPull1 = remainingSlots >= 1;
  const canPull10 = !singleOnly && remainingSlots >= 10;

  return (
    <div className="card-surface mt-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <span>
            <Link href="/legal/terms" className="text-gold underline">
              利用規約
            </Link>
            ・
            <Link href="/legal/tokusho" className="text-gold underline">
              特商法
            </Link>
            に同意して購入します
          </span>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href={agreed && canPull1 ? `/gacha/${gachaId}/play?count=1` : "#"}
          className={`btn-primary flex-1 text-center ${!agreed || !canPull1 ? "pointer-events-none opacity-45" : ""}`}
          aria-disabled={!agreed || !canPull1}
        >
          1回引く（{formatPoints(pricePerPull)}）
        </Link>
        {!singleOnly && (
          <Link
            href={agreed && canPull10 ? `/gacha/${gachaId}/play?count=10` : "#"}
            className={`btn-secondary flex-1 text-center ${!agreed || !canPull10 ? "pointer-events-none opacity-45" : ""}`}
            aria-disabled={!agreed || !canPull10}
          >
            10連引く（{formatPoints(pricePerPull * 10)}）
          </Link>
        )}
      </div>

      {!canPull1 && (
        <p className="mt-3 text-sm text-danger">残り口数が不足しています。</p>
      )}
      {singleOnly && canPull1 && (
        <p className="mt-3 text-sm text-muted">このガチャは1回のみ引けます。</p>
      )}
      {canPull1 && !canPull10 && !singleOnly && (
        <p className="mt-3 text-sm text-muted">10連は残り口数が10口以上必要です。</p>
      )}
    </div>
  );
}

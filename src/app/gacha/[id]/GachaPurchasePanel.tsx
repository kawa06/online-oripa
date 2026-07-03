"use client";

import Link from "next/link";
import { useState } from "react";
import { formatYen } from "@/lib/utils";

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
  const [termsOk, setTermsOk] = useState(false);
  const [noticeOk, setNoticeOk] = useState(false);
  const confirmed = termsOk && noticeOk;
  const singleOnly = isDailyOnce || isFirstTimeOnly;
  const canPull1 = remainingSlots >= 1;
  const canPull10 = !singleOnly && remainingSlots >= 10;

  return (
    <div className="card-surface mt-6 p-4 md:p-6">
      <h2 className="text-lg font-bold">ガチャを引く</h2>
      <p className="mt-1 text-sm text-muted">
        1回 {formatYen(pricePerPull)} / 10連 {formatYen(pricePerPull * 10)}
      </p>

      <div className="mt-4 space-y-3 text-sm">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={termsOk}
            onChange={(e) => setTermsOk(e.target.checked)}
            className="mt-1"
          />
          <span>
            <Link href="/legal/terms" className="text-gold underline">
              利用規約
            </Link>
            および
            <Link href="/legal/tokusho" className="text-gold underline">
              特定商取引法
            </Link>
            に同意します
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={noticeOk}
            onChange={(e) => setNoticeOk(e.target.checked)}
            className="mt-1"
          />
          <span>景品の排出率・残数表示を確認し、通信販売による購入であることを理解しました</span>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={confirmed && canPull1 ? `/gacha/${gachaId}/play?count=1` : "#"}
          className={`btn-primary flex-1 text-center ${!confirmed || !canPull1 ? "pointer-events-none opacity-45" : ""}`}
          aria-disabled={!confirmed || !canPull1}
        >
          1回引く
        </Link>
        <Link
          href={confirmed && canPull10 ? `/gacha/${gachaId}/play?count=10` : "#"}
          className={`btn-secondary flex-1 text-center ${!confirmed || !canPull10 ? "pointer-events-none opacity-45" : ""}`}
          aria-disabled={!confirmed || !canPull10}
        >
          10連引く
        </Link>
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

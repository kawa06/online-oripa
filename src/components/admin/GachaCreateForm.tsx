"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calcGachaMetrics, formatYen } from "@/lib/utils";
import { createGacha } from "@/app/admin/_actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { PrizeRank } from "@prisma/client";

const RANKS: PrizeRank[] = ["S", "A", "B", "C", "LOSE", "LAST_ONE", "KIRI"];
const GUARANTEE_RANKS: PrizeRank[] = ["S", "A", "B", "C"];

type PrizeRow = {
  rank: PrizeRank;
  name: string;
  quantity: number;
  marketPrice: number;
  costPrice: number;
  cardId: string;
};

const emptyPrize = (): PrizeRow => ({
  rank: "A",
  name: "",
  quantity: 1,
  marketPrice: 0,
  costPrice: 0,
  cardId: "",
});

export function GachaCreateForm({ cards = [] }: { cards?: { id: string; name: string; barcode: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pricePerPull, setPricePerPull] = useState(500);
  const [totalSlots, setTotalSlots] = useState(100);
  const [isDailyOnce, setIsDailyOnce] = useState(false);
  const [isFirstTimeOnly, setIsFirstTimeOnly] = useState(false);
  const [kiriNumber, setKiriNumber] = useState("");
  const [minGuaranteeRank, setMinGuaranteeRank] = useState<PrizeRank | "">("");
  const [minGuaranteeNote, setMinGuaranteeNote] = useState("");
  const [prizes, setPrizes] = useState<PrizeRow[]>([emptyPrize(), emptyPrize()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const metrics = useMemo(
    () => calcGachaMetrics(totalSlots, pricePerPull, prizes),
    [totalSlots, pricePerPull, prizes]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const id = await createGacha({
        title,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        pricePerPull,
        totalSlots,
        isDailyOnce,
        isFirstTimeOnly,
        kiriNumber: kiriNumber ? Number(kiriNumber) : null,
        minGuaranteeRank: minGuaranteeRank || null,
        minGuaranteeNote: minGuaranteeNote || undefined,
        prizes: prizes
          .filter((p) => p.name.trim())
          .map((p) => ({
            rank: p.rank,
            name: p.name,
            quantity: p.quantity,
            marketPrice: p.marketPrice,
            costPrice: p.costPrice,
            cardId: p.cardId || undefined,
          })),
      });
      router.push(`/admin/gachas/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-surface space-y-4 p-5">
        <h2 className="font-bold">基本情報</h2>
        <div>
          <label className="mb-1 block text-sm text-muted">タイトル</label>
          <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">説明</label>
          <textarea className="input-field" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <ImageUploadField folder="gachas" value={imageUrl} onChange={setImageUrl} label="ガチャ画像" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted">1回あたり価格 (pt)</label>
            <input type="number" className="input-field" value={pricePerPull} onChange={(e) => setPricePerPull(Number(e.target.value))} min={1} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">総口数</label>
            <input type="number" className="input-field" value={totalSlots} onChange={(e) => setTotalSlots(Number(e.target.value))} min={1} required />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isDailyOnce} onChange={(e) => setIsDailyOnce(e.target.checked)} />
            1日1回限定
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isFirstTimeOnly} onChange={(e) => setIsFirstTimeOnly(e.target.checked)} />
            初回限定
          </label>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-muted">キリ番（口数・任意）</label>
            <input type="number" className="input-field" placeholder="例: 777" value={kiriNumber} min={1} onChange={(e) => setKiriNumber(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">10連最低保証ランク</label>
            <select className="input-field" value={minGuaranteeRank} onChange={(e) => setMinGuaranteeRank(e.target.value as PrizeRank | "")}>
              <option value="">なし</option>
              {GUARANTEE_RANKS.map((r) => (
                <option key={r} value={r}>{r} 以上</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">最低保証の説明</label>
            <input className="input-field" placeholder="10連でB以上1枚保障" value={minGuaranteeNote} onChange={(e) => setMinGuaranteeNote(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">景品</h2>
          <button type="button" className="btn-secondary text-sm" onClick={() => setPrizes([...prizes, emptyPrize()])}>
            行を追加
          </button>
        </div>
        <div className="space-y-3">
          {prizes.map((p, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-7">
              <select className="input-field" value={p.rank} onChange={(e) => { const next = [...prizes]; next[i] = { ...p, rank: e.target.value as PrizeRank }; setPrizes(next); }}>
                {RANKS.map((r) => (<option key={r} value={r}>{r}</option>))}
              </select>
              <input className="input-field sm:col-span-2" placeholder="景品名" value={p.name} onChange={(e) => { const next = [...prizes]; next[i] = { ...p, name: e.target.value }; setPrizes(next); }} />
              <input type="number" className="input-field" placeholder="数量" value={p.quantity} min={1} onChange={(e) => { const next = [...prizes]; next[i] = { ...p, quantity: Number(e.target.value) }; setPrizes(next); }} />
              <input type="number" className="input-field" placeholder="相場" value={p.marketPrice} onChange={(e) => { const next = [...prizes]; next[i] = { ...p, marketPrice: Number(e.target.value) }; setPrizes(next); }} />
              <input type="number" className="input-field" placeholder="原価" value={p.costPrice} onChange={(e) => { const next = [...prizes]; next[i] = { ...p, costPrice: Number(e.target.value) }; setPrizes(next); }} />
              {cards.length > 0 && (
                <select className="input-field sm:col-span-2" value={p.cardId} onChange={(e) => { const next = [...prizes]; next[i] = { ...p, cardId: e.target.value }; setPrizes(next); }}>
                  <option value="">在庫なし</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-5">
        <h2 className="mb-3 font-bold">還元シミュレーション</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p>想定売上: {formatYen(metrics.totalRevenue)}</p>
          <p>景品原価: {formatYen(metrics.totalCost)}</p>
          <p>景品相場合計: {formatYen(metrics.totalPrizeValue)}</p>
          <p>利益: {formatYen(metrics.profit)}</p>
          <p className="sm:col-span-2">
            還元率:{" "}
            <span className={metrics.returnRate < 70 ? "font-bold text-red-500" : "text-success"}>
              {metrics.returnRate.toFixed(1)}%
            </span>
          </p>
        </div>
        {metrics.returnRate < 70 && (
          <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
            還元率が70%未満です。景品相場または単価・口数の見直しを推奨します。
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "作成中..." : "ガチャを作成"}
      </button>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import { calcGachaMetrics, formatPoints, formatYen } from "@/lib/utils";
import { addGachaPrize, deleteGachaPrize, updateGacha } from "@/app/admin/_actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Gacha, GachaPrize, GachaStatus, PrizeRank } from "@prisma/client";

const STATUSES: GachaStatus[] = ["DRAFT", "PUBLISHED", "HIDDEN"];
const RANKS: PrizeRank[] = ["S", "A", "B", "C", "LOSE", "LAST_ONE", "KIRI"];
const GUARANTEE_RANKS: PrizeRank[] = ["S", "A", "B", "C"];

export function GachaEditForm({
  gacha,
  prizes,
  cards = [],
}: {
  gacha: Gacha;
  prizes: GachaPrize[];
  cards?: { id: string; name: string; barcode: string }[];
}) {
  const [title, setTitle] = useState(gacha.title);
  const [description, setDescription] = useState(gacha.description ?? "");
  const [imageUrl, setImageUrl] = useState(gacha.imageUrl ?? "");
  const [pricePerPull, setPricePerPull] = useState(gacha.pricePerPull);
  const [status, setStatus] = useState(gacha.status);
  const [noticeText, setNoticeText] = useState(gacha.noticeText ?? "");
  const [isDailyOnce, setIsDailyOnce] = useState(gacha.isDailyOnce);
  const [isFirstTimeOnly, setIsFirstTimeOnly] = useState(gacha.isFirstTimeOnly);
  const [kiriNumber, setKiriNumber] = useState(gacha.kiriNumber?.toString() ?? "");
  const [minGuaranteeNote, setMinGuaranteeNote] = useState(gacha.minGuaranteeNote ?? "");
  const [minGuaranteeRank, setMinGuaranteeRank] = useState<PrizeRank | "">(gacha.minGuaranteeRank ?? "");
  const [saving, setSaving] = useState(false);
  const [newPrize, setNewPrize] = useState({
    rank: "A" as PrizeRank,
    name: "",
    quantity: 1,
    marketPrice: 0,
    costPrice: 0,
    cardId: "",
  });

  const metrics = useMemo(
    () => calcGachaMetrics(gacha.totalSlots, pricePerPull, prizes.map((p) => ({ quantity: p.quantity, marketPrice: p.marketPrice, costPrice: p.costPrice }))),
    [gacha.totalSlots, pricePerPull, prizes]
  );

  async function save() {
    setSaving(true);
    await updateGacha(gacha.id, {
      title,
      description,
      imageUrl: imageUrl || undefined,
      pricePerPull,
      status,
      noticeText,
      isDailyOnce,
      isFirstTimeOnly,
      kiriNumber: kiriNumber ? Number(kiriNumber) : null,
      minGuaranteeNote: minGuaranteeNote || undefined,
      minGuaranteeRank: minGuaranteeRank || null,
    });
    setSaving(false);
  }

  async function addPrize() {
    if (!newPrize.name.trim()) return;
    await addGachaPrize(gacha.id, {
      ...newPrize,
      cardId: newPrize.cardId || undefined,
    });
    setNewPrize({ rank: "A", name: "", quantity: 1, marketPrice: 0, costPrice: 0, cardId: "" });
  }

  return (
    <div className="space-y-6">
      <div className="card-surface space-y-4 p-5">
        <h2 className="font-bold">基本設定</h2>
        <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input-field" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        <ImageUploadField folder="gachas" value={imageUrl} onChange={setImageUrl} label="ガチャ画像" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-muted">単価 (Pコイン)</label>
            <input type="number" className="input-field" value={pricePerPull} onChange={(e) => setPricePerPull(Number(e.target.value))} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">公開状態</label>
            <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value as GachaStatus)}>
              {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" className="btn-primary w-full" onClick={save} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
        <textarea className="input-field" rows={2} placeholder="注意事項" value={noticeText} onChange={(e) => setNoticeText(e.target.value)} />
        <textarea className="input-field" rows={2} placeholder="最低保証の説明" value={minGuaranteeNote} onChange={(e) => setMinGuaranteeNote(e.target.value)} />
        <div>
          <label className="mb-1 block text-sm text-muted">10連最低保証ランク</label>
          <select className="input-field" value={minGuaranteeRank} onChange={(e) => setMinGuaranteeRank(e.target.value as PrizeRank | "")}>
            <option value="">なし</option>
            {GUARANTEE_RANKS.map((r) => (
              <option key={r} value={r}>{r} 以上</option>
            ))}
          </select>
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
            <label className="mb-1 block text-sm text-muted">キリ番（口数）</label>
            <input type="number" className="input-field" value={kiriNumber} min={1} onChange={(e) => setKiriNumber(e.target.value)} />
          </div>
        </div>
        <p className="text-sm text-muted">残り {gacha.remainingSlots.toLocaleString()} / {gacha.totalSlots.toLocaleString()} 口</p>
      </div>

      <div className="card-surface p-5">
        <h2 className="mb-3 font-bold">還元指標</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p>想定売上: {formatPoints(metrics.totalRevenue)}</p>
          <p>利益: {formatPoints(metrics.profit)}</p>
          <p className="sm:col-span-2">
            還元率:{" "}
            <span className={metrics.returnRate < 70 ? "font-bold text-red-500" : "text-success"}>
              {metrics.returnRate.toFixed(1)}%
            </span>
          </p>
        </div>
        {metrics.returnRate < 70 && (
          <p className="mt-2 text-sm text-red-400">還元率70%未満 — 設定を見直してください</p>
        )}
      </div>

      <div className="card-surface table-scroll">
        <h2 className="border-b border-border p-4 font-bold">景品一覧</h2>
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated text-left text-muted">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">名称</th>
              <th className="p-3">残 / 総</th>
              <th className="p-3">相場</th>
              <th className="p-3">原価</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((p) => (
              <tr key={p.id} className="border-t border-border/50">
                <td className="p-3">{p.rank}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.remainingQuantity} / {p.quantity}</td>
                <td className="p-3">{formatYen(p.marketPrice)}</td>
                <td className="p-3">{formatYen(p.costPrice)}</td>
                <td className="p-3">
                  <button type="button" className="text-sm text-red-400 hover:underline" onClick={() => deleteGachaPrize(p.id, gacha.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-surface space-y-3 p-5">
        <h2 className="font-bold">景品追加</h2>
        <div className="grid gap-2 sm:grid-cols-6">
          <select className="input-field" value={newPrize.rank} onChange={(e) => setNewPrize({ ...newPrize, rank: e.target.value as PrizeRank })}>
            {RANKS.map((r) => (<option key={r} value={r}>{r}</option>))}
          </select>
          <input className="input-field sm:col-span-2" placeholder="景品名" value={newPrize.name} onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })} />
          <input type="number" className="input-field" placeholder="数量" value={newPrize.quantity} onChange={(e) => setNewPrize({ ...newPrize, quantity: Number(e.target.value) })} />
          <input type="number" className="input-field" placeholder="相場" value={newPrize.marketPrice} onChange={(e) => setNewPrize({ ...newPrize, marketPrice: Number(e.target.value) })} />
          <input type="number" className="input-field" placeholder="原価" value={newPrize.costPrice} onChange={(e) => setNewPrize({ ...newPrize, costPrice: Number(e.target.value) })} />
        </div>
        {cards.length > 0 && (
          <select
            className="input-field"
            value={newPrize.cardId}
            onChange={(e) => setNewPrize({ ...newPrize, cardId: e.target.value })}
          >
            <option value="">在庫カードを紐付け（任意）</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.barcode})</option>
            ))}
          </select>
        )}
        <button type="button" className="btn-secondary" onClick={addPrize}>景品を追加</button>
      </div>
    </div>
  );
}

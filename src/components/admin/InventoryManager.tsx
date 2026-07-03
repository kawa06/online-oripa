"use client";

import { useState, type ReactNode } from "react";
import { upsertCard, deleteCard } from "@/app/admin/_actions";
import { formatYen } from "@/lib/utils";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Card, PrizeRank } from "@prisma/client";

const RANKS: PrizeRank[] = ["S", "A", "B", "C", "LOSE", "LAST_ONE", "KIRI"];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {hint && <p className="mb-1 text-xs text-muted">{hint}</p>}
      {children}
    </div>
  );
}

export function InventoryManager({
  cards,
  priceHistory,
}: {
  cards: Card[];
  priceHistory: { cardId: string; marketPrice: number; buyPrice: number; sellPrice: number; changedAt: string; note: string | null }[];
}) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    category: "",
    condition: "",
    rank: "" as PrizeRank | "",
    imageUrl: "",
    stockQuantity: "",
    marketPrice: "",
    buyPrice: "",
    sellPrice: "",
  });
  const [loading, setLoading] = useState(false);

  function editCard(card: Card) {
    setForm({
      id: card.id,
      name: card.name,
      category: card.category ?? "",
      condition: card.condition ?? "",
      rank: card.rank ?? "",
      imageUrl: card.imageUrl ?? "",
      stockQuantity: String(card.stockQuantity),
      marketPrice: String(card.marketPrice),
      buyPrice: String(card.buyPrice),
      sellPrice: String(card.sellPrice),
    });
  }

  function resetForm() {
    setForm({
      id: "",
      name: "",
      category: "",
      condition: "",
      rank: "",
      imageUrl: "",
      stockQuantity: "",
      marketPrice: "",
      buyPrice: "",
      sellPrice: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await upsertCard({
      id: form.id || undefined,
      name: form.name,
      category: form.category || undefined,
      condition: form.condition || undefined,
      rank: form.rank || undefined,
      imageUrl: form.imageUrl || undefined,
      stockQuantity: Number(form.stockQuantity || 0),
      marketPrice: Number(form.marketPrice || 0),
      buyPrice: Number(form.buyPrice || 0),
      sellPrice: Number(form.sellPrice || 0),
    });
    resetForm();
    setLoading(false);
  }

  const history = form.id ? priceHistory.filter((h) => h.cardId === form.id).slice(0, 5) : [];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card-surface space-y-4 p-5">
        <h2 className="font-bold">{form.id ? "カード編集" : "カード新規登録"}</h2>
        <p className="text-xs text-muted">新規登録時は管理コード・バーコードを自動生成します</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="カード名">
            <input
              className="input-field"
              placeholder="例: ピカチュウ SAR"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="カテゴリ" hint="例: ポケモン / ワンピース">
            <input
              className="input-field"
              placeholder="例: ポケモン"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Field label="状態" hint="例: NM / 美品">
            <input
              className="input-field"
              placeholder="例: NM"
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
            />
          </Field>
          <Field label="ランク" hint="ガチャ景品の等級">
            <select className="input-field" value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value as PrizeRank })}>
              <option value="">ランクなし</option>
              {RANKS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="在庫数（枚）" hint="倉庫にある枚数。例: 10">
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="input-field"
              placeholder="例: 10"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
            />
          </Field>
          <Field label="相場価格（円）" hint="市場での参考価格。例: 20000">
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="input-field"
              placeholder="例: 20000"
              value={form.marketPrice}
              onChange={(e) => setForm({ ...form, marketPrice: e.target.value })}
            />
          </Field>
          <Field label="買取価格（円）" hint="お店が買い取る価格。例: 15000">
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="input-field"
              placeholder="例: 15000"
              value={form.buyPrice}
              onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
            />
          </Field>
          <Field label="販売価格（円）" hint="お店で売る価格。例: 25000">
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="input-field"
              placeholder="例: 25000"
              value={form.sellPrice}
              onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
            />
          </Field>
        </div>
        <ImageUploadField folder="cards" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
        {history.length > 0 && (
          <div className="rounded-lg border border-border p-3 text-xs text-muted">
            <p className="mb-2 font-bold text-text">価格履歴</p>
            {history.map((h, i) => (
              <p key={i}>
                {new Date(h.changedAt).toLocaleDateString("ja-JP")} — 相場 {formatYen(h.marketPrice)} / 買取 {formatYen(h.buyPrice)}
              </p>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </button>
          {form.id && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              キャンセル
            </button>
          )}
        </div>
      </form>
      <div className="card-surface table-scroll">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-elevated text-left text-muted">
            <tr>
              <th className="p-3">名称</th>
              <th className="p-3">在庫</th>
              <th className="p-3">相場</th>
              <th className="p-3">バーコード</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id} className="border-b border-border/50">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {c.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
                    )}
                    {c.name}
                  </div>
                </td>
                <td className={`p-3 ${c.stockQuantity <= 3 ? "font-bold text-danger" : ""}`}>{c.stockQuantity}</td>
                <td className="p-3">{formatYen(c.marketPrice)}</td>
                <td className="p-3 font-mono text-xs">{c.barcode}</td>
                <td className="space-x-2 p-3 text-right">
                  <button type="button" className="text-gold hover:underline" onClick={() => editCard(c)}>
                    編集
                  </button>
                  <button type="button" className="text-red-400 hover:underline" onClick={() => deleteCard(c.id)}>
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

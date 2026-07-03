"use client";

import { useState } from "react";
import { upsertCard, deleteCard } from "@/app/admin/_actions";
import { formatYen } from "@/lib/utils";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Card, PrizeRank } from "@prisma/client";

const RANKS: PrizeRank[] = ["S", "A", "B", "C", "LOSE", "LAST_ONE", "KIRI"];

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
    stockQuantity: 0,
    marketPrice: 0,
    buyPrice: 0,
    sellPrice: 0,
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
      stockQuantity: card.stockQuantity,
      marketPrice: card.marketPrice,
      buyPrice: card.buyPrice,
      sellPrice: card.sellPrice,
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
      stockQuantity: 0,
      marketPrice: 0,
      buyPrice: 0,
      sellPrice: 0,
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
      stockQuantity: form.stockQuantity,
      marketPrice: form.marketPrice,
      buyPrice: form.buyPrice,
      sellPrice: form.sellPrice,
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
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input-field" placeholder="カード名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" placeholder="カテゴリ" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="input-field" placeholder="状態" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
          <select className="input-field" value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value as PrizeRank })}>
            <option value="">ランクなし</option>
            {RANKS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input type="number" className="input-field" placeholder="在庫数" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} />
          <input type="number" className="input-field" placeholder="相場" value={form.marketPrice} onChange={(e) => setForm({ ...form, marketPrice: Number(e.target.value) })} />
          <input type="number" className="input-field" placeholder="買取価格" value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: Number(e.target.value) })} />
          <input type="number" className="input-field" placeholder="販売価格" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })} />
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
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "保存中..." : "保存"}</button>
          {form.id && <button type="button" className="btn-secondary" onClick={resetForm}>キャンセル</button>}
        </div>
      </form>
      <div className="card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-elevated text-left text-muted">
            <tr><th className="p-3">名称</th><th className="p-3">在庫</th><th className="p-3">相場</th><th className="p-3">バーコード</th><th className="p-3"></th></tr>
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
                <td className={`p-3 ${c.stockQuantity <= 3 ? "text-danger font-bold" : ""}`}>{c.stockQuantity}</td>
                <td className="p-3">{formatYen(c.marketPrice)}</td>
                <td className="p-3 font-mono text-xs">{c.barcode}</td>
                <td className="p-3 space-x-2 text-right">
                  <button type="button" className="text-gold hover:underline" onClick={() => editCard(c)}>編集</button>
                  <button type="button" className="text-red-400 hover:underline" onClick={() => deleteCard(c.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

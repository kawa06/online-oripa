"use client";

import { useState } from "react";
import { upsertBuylistItem, deleteBuylistItem } from "@/app/admin/_actions";
import { formatYen } from "@/lib/utils";
import type { BuylistCategory, BuylistItem } from "@prisma/client";

const CATEGORIES: BuylistCategory[] = ["BOX", "PACK", "PSA", "SAR", "SR", "AR", "RR", "OTHER"];

export function BuylistManager({ items }: { items: BuylistItem[] }) {
  const [category, setCategory] = useState<BuylistCategory>("SAR");
  const [form, setForm] = useState({ id: "", name: "", condition: "", buyPrice: 0, note: "" });
  const filtered = items.filter((i) => i.category === category);

  function editItem(item: BuylistItem) {
    setForm({ id: item.id, name: item.name, condition: item.condition ?? "", buyPrice: item.buyPrice, note: item.note ?? "" });
    setCategory(item.category);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await upsertBuylistItem({ id: form.id || undefined, category, name: form.name, condition: form.condition || undefined, buyPrice: form.buyPrice, note: form.note || undefined });
    setForm({ id: "", name: "", condition: "", buyPrice: 0, note: "" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className={`rounded-lg px-3 py-1 text-sm ${category === c ? "bg-gold/20 text-gold" : "bg-bg-elevated"}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="card-surface grid gap-3 p-5 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-bold">{form.id ? "編集" : "新規"} — {category}</h2>
        <input className="input-field" placeholder="カード名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input-field" placeholder="状態" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
        <input type="number" className="input-field" placeholder="買取価格" value={form.buyPrice || ""} onChange={(e) => setForm({ ...form, buyPrice: Number(e.target.value) })} required />
        <input className="input-field" placeholder="備考" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <button type="submit" className="btn-primary sm:col-span-2">保存</button>
      </form>
      <div className="card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-elevated text-left text-muted">
            <tr><th className="p-3">名称</th><th className="p-3">状態</th><th className="p-3">買取価格</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.condition ?? "—"}</td>
                <td className="p-3">{formatYen(item.buyPrice)}</td>
                <td className="p-3 space-x-2 text-right">
                  <button type="button" className="text-gold hover:underline" onClick={() => editItem(item)}>編集</button>
                  <button type="button" className="text-red-400 hover:underline" onClick={() => deleteBuylistItem(item.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

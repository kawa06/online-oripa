"use client";

import { useState, type ReactNode } from "react";
import { upsertBuylistItem, deleteBuylistItem } from "@/app/admin/_actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { formatYen } from "@/lib/utils";
import type { BuylistCategory, BuylistItem } from "@prisma/client";

const CATEGORIES: BuylistCategory[] = ["BOX", "PACK", "PSA", "SAR", "SR", "AR", "RR", "OTHER"];

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {hint && <p className="mb-1 text-xs text-muted">{hint}</p>}
      {children}
    </div>
  );
}

export function BuylistManager({ items }: { items: BuylistItem[] }) {
  const [category, setCategory] = useState<BuylistCategory>("SAR");
  const [form, setForm] = useState({
    id: "",
    name: "",
    condition: "",
    buyPrice: "",
    note: "",
    imageUrl: "",
  });
  const filtered = items.filter((i) => i.category === category);

  function editItem(item: BuylistItem) {
    setForm({
      id: item.id,
      name: item.name,
      condition: item.condition ?? "",
      buyPrice: String(item.buyPrice),
      note: item.note ?? "",
      imageUrl: item.imageUrl ?? "",
    });
    setCategory(item.category);
  }

  function resetForm() {
    setForm({ id: "", name: "", condition: "", buyPrice: "", note: "", imageUrl: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await upsertBuylistItem({
      id: form.id || undefined,
      category,
      name: form.name,
      condition: form.condition || undefined,
      buyPrice: Number(form.buyPrice),
      note: form.note || undefined,
      imageUrl: form.imageUrl || undefined,
    });
    resetForm();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`rounded-lg px-3 py-1 text-sm ${category === c ? "bg-gold/20 text-gold" : "bg-bg-elevated"}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="card-surface grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-bold">{form.id ? "編集" : "新規"} — {category}</h2>
        <Field label="カード名" className="sm:col-span-2">
          <input
            className="input-field"
            placeholder="例: ピカチュウ SAR"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Field>
        <Field label="状態" hint="例: NM / 美品 / PSA10">
          <input
            className="input-field"
            placeholder="例: NM"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
          />
        </Field>
        <Field label="買取価格（円）" hint="数字のみ。例: 15000">
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="input-field"
            placeholder="例: 15000"
            value={form.buyPrice}
            onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
            required
          />
        </Field>
        <Field label="備考" className="sm:col-span-2">
          <input
            className="input-field"
            placeholder="例: 在庫限り / 箱なし"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <ImageUploadField
            folder="buylist"
            label="カード画像"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
          />
        </div>
        <button type="submit" className="btn-primary sm:col-span-2">
          保存
        </button>
      </form>
      <div className="card-surface table-scroll">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-elevated text-left text-muted">
            <tr>
              <th className="p-3">画像</th>
              <th className="p-3">名称</th>
              <th className="p-3">状態</th>
              <th className="p-3">買取価格</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="p-3">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.condition ?? "—"}</td>
                <td className="p-3">{formatYen(item.buyPrice)}</td>
                <td className="space-x-2 p-3 text-right">
                  <button type="button" className="text-gold hover:underline" onClick={() => editItem(item)}>
                    編集
                  </button>
                  <button type="button" className="text-red-400 hover:underline" onClick={() => deleteBuylistItem(item.id)}>
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

"use client";

import { useState } from "react";
import { deleteCoupon, upsertCoupon } from "@/app/admin/_actions";
import type { Coupon } from "@prisma/client";

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [form, setForm] = useState({
    code: "",
    points: 100,
    maxUses: "" as string | number,
    expiresAt: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await upsertCoupon({
      code: form.code,
      points: form.points,
      maxUses: form.maxUses === "" ? null : Number(form.maxUses),
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
      isActive: form.isActive,
    });
    setForm({ code: "", points: 100, maxUses: "", expiresAt: "", isActive: true });
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="card-surface space-y-4 p-5">
        <h2 className="font-bold">クーポン作成</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input-field font-mono uppercase" placeholder="コード" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <input type="number" className="input-field" placeholder="付与ポイント" value={form.points} min={1} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} required />
          <input type="number" className="input-field" placeholder="使用上限（空=無制限）" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          <input type="date" className="input-field" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          有効
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "作成中..." : "作成"}</button>
      </form>

      <div className="card-surface table-scroll">
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated text-left text-muted">
            <tr>
              <th className="p-3">コード</th>
              <th className="p-3">pt</th>
              <th className="p-3">使用数</th>
              <th className="p-3">期限</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-border/50">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">{c.points}</td>
                <td className="p-3">{c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ""}</td>
                <td className="p-3">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("ja-JP") : "—"}</td>
                <td className="p-3">
                  <button type="button" className="text-sm text-red-400 hover:underline" onClick={() => deleteCoupon(c.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

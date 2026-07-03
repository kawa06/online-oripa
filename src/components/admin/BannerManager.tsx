"use client";

import { useState } from "react";
import { deleteBanner, upsertBanner } from "@/app/admin/_actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Banner } from "@prisma/client";

export function BannerManager({ banners }: { banners: Banner[] }) {
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    sortOrder: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await upsertBanner(form);
    setForm({ title: "", imageUrl: "", linkUrl: "", sortOrder: 0, isActive: true });
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="card-surface space-y-4 p-5">
        <h2 className="font-bold">バナー追加</h2>
        <input className="input-field" placeholder="タイトル" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <ImageUploadField folder="banners" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
        <input className="input-field" placeholder="リンクURL（任意）" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <input type="number" className="input-field" placeholder="表示順" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            公開中
          </label>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "保存中..." : "追加"}</button>
      </form>

      <div className="card-surface table-scroll">
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated text-left text-muted">
            <tr>
              <th className="p-3">タイトル</th>
              <th className="p-3">順序</th>
              <th className="p-3">状態</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id} className="border-t border-border/50">
                <td className="p-3">{b.title}</td>
                <td className="p-3">{b.sortOrder}</td>
                <td className="p-3">{b.isActive ? "公開" : "非公開"}</td>
                <td className="p-3">
                  <button type="button" className="text-sm text-red-400 hover:underline" onClick={() => deleteBanner(b.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

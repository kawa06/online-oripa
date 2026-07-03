"use client";

import { useState } from "react";
import { deleteAnnouncement, upsertAnnouncement } from "@/app/admin/_actions";
import type { Announcement } from "@prisma/client";

export function AnnouncementManager({ items }: { items: Announcement[] }) {
  const [form, setForm] = useState({ title: "", body: "", isActive: true });
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await upsertAnnouncement(form);
    setForm({ title: "", body: "", isActive: true });
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="card-surface space-y-4 p-5">
        <h2 className="font-bold">お知らせ追加</h2>
        <input className="input-field" placeholder="タイトル" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="input-field" rows={4} placeholder="本文" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          公開中
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "保存中..." : "追加"}</button>
      </form>

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="card-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold">{a.title}</p>
                <p className="mt-1 text-sm text-muted whitespace-pre-wrap">{a.body}</p>
                <p className="mt-2 text-xs text-muted">{a.isActive ? "公開中" : "非公開"}</p>
              </div>
              <button type="button" className="text-sm text-red-400 hover:underline shrink-0" onClick={() => deleteAnnouncement(a.id)}>削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

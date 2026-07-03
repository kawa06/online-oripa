"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type Notification = {
  id: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setItems(data.notifications ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">通知</h1>
      {loading ? (
        <div className="card-surface mt-6 p-8 text-center text-muted">読み込み中...</div>
      ) : items.length === 0 ? (
        <div className="card-surface mt-6 p-8 text-center text-muted">通知はありません</div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((n) => (
            <div key={n.id} className={`card-surface p-4 ${n.isRead ? "opacity-75" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">{n.title}</p>
                  <p className="mt-1 break-words whitespace-pre-wrap text-sm text-muted">{n.body}</p>
                  <p className="mt-2 text-xs text-muted">
                    {format(new Date(n.createdAt), "yyyy/MM/dd HH:mm", { locale: ja })}
                  </p>
                  {n.linkUrl && (
                    <Link href={n.linkUrl} className="mt-2 inline-block text-sm text-gold">
                      詳細を見る →
                    </Link>
                  )}
                </div>
                {!n.isRead && (
                  <button type="button" className="btn-secondary text-xs shrink-0" onClick={() => markRead(n.id)}>
                    既読
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Link href="/mypage" className="mt-8 inline-block text-sm text-gold">
        ← マイページ
      </Link>
    </div>
  );
}

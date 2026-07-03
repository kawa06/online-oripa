"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<
    { id: string; title: string; body: string; linkUrl: string | null; isRead: boolean; createdAt: string }[]
  >([]);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="relative rounded-lg border border-border bg-bg-elevated px-3 py-2 text-xs"
        onClick={() => setOpen((v) => !v)}
        aria-label="通知"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-bg-card p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold">通知</p>
            {unreadCount > 0 && (
              <button type="button" className="text-xs text-gold" onClick={markAllRead}>
                すべて既読
              </button>
            )}
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {items.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">通知はありません</p>
            ) : (
              items.slice(0, 8).map((n) => (
                <div key={n.id} className={`rounded-lg p-2 text-sm ${n.isRead ? "opacity-70" : "bg-bg-elevated"}`}>
                  <p className="font-semibold">{n.title}</p>
                  <p className="mt-1 text-xs text-muted">{n.body}</p>
                  {n.linkUrl && (
                    <Link href={n.linkUrl} className="mt-1 inline-block text-xs text-gold" onClick={() => setOpen(false)}>
                      詳細 →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
          <Link href="/notifications" className="mt-2 block text-center text-xs text-gold" onClick={() => setOpen(false)}>
            すべて見る
          </Link>
        </div>
      )}
    </div>
  );
}

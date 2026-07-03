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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        className="relative rounded-lg border border-border bg-bg-elevated px-3 py-2 text-xs"
        onClick={() => setOpen((v) => !v)}
        aria-label="通知"
        aria-expanded={open}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="通知を閉じる"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-4 right-4 top-[4.5rem] z-50 flex max-h-[calc(100vh-6rem)] flex-col rounded-xl border border-border bg-bg-card p-3 shadow-xl md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-80 md:max-h-none">
            <div className="mb-2 flex shrink-0 items-center justify-between">
              <p className="text-sm font-bold">通知</p>
              {unreadCount > 0 && (
                <button type="button" className="text-xs text-gold" onClick={markAllRead}>
                  すべて既読
                </button>
              )}
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
              {items.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted">通知はありません</p>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-lg p-2 text-sm ${n.isRead ? "opacity-70" : "bg-bg-elevated"}`}
                  >
                    <p className="break-words font-semibold">{n.title}</p>
                    <p className="mt-1 break-words whitespace-pre-wrap text-xs text-muted">{n.body}</p>
                    {n.linkUrl && (
                      <Link
                        href={n.linkUrl}
                        className="mt-1 inline-block text-xs text-gold"
                        onClick={() => setOpen(false)}
                      >
                        詳細 →
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
            <Link
              href="/notifications"
              className="mt-2 block shrink-0 text-center text-xs text-gold"
              onClick={() => setOpen(false)}
            >
              すべて見る
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

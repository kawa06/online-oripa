"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-[70vh] overflow-x-hidden">
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="メニューを閉じる"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm"
            onClick={() => setMenuOpen(true)}
            aria-label="管理メニューを開く"
          >
            ☰ メニュー
          </button>
          <p className="text-sm font-bold text-gold">管理画面</p>
        </div>
        <div className="overflow-x-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

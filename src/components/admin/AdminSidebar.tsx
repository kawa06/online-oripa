"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "ダッシュボード", exact: true },
  { href: "/admin/gachas", label: "ガチャ" },
  { href: "/admin/inventory", label: "在庫" },
  { href: "/admin/shipping", label: "発送" },
  { href: "/admin/users", label: "ユーザー" },
  { href: "/admin/buylist", label: "買取表" },
  { href: "/admin/banners", label: "バナー" },
  { href: "/admin/announcements", label: "お知らせ" },
  { href: "/admin/coupons", label: "クーポン" },
  { href: "/admin/fraud", label: "不正検知" },
  { href: "/admin/sales", label: "売上" },
  { href: "/admin/inquiries", label: "お問い合わせ" },
];

type Props = {
  open?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({ open = false, onClose }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-56 shrink-0 border-r border-border bg-bg-card p-4 transition-transform md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-gold">Admin</p>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-sm text-muted md:hidden"
          onClick={onClose}
          aria-label="メニューを閉じる"
        >
          ✕
        </button>
      </div>
      <nav className="max-h-[calc(100vh-5rem)] space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-gold/15 font-semibold text-gold"
                  : "text-muted hover:bg-bg-elevated hover:text-text"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

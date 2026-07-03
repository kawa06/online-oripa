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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-bg-card p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gold">Admin</p>
      <nav className="space-y-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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

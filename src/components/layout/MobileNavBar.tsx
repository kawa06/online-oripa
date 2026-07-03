import Link from "next/link";

const LINKS = [
  { href: "/gacha", label: "ガチャ" },
  { href: "/legal/buylist", label: "買取表" },
  { href: "/contact", label: "お問い合わせ" },
];

export function MobileNavBar() {
  return (
    <nav className="border-t border-border md:hidden">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 text-sm">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-lg border border-border bg-bg-elevated px-4 py-2 text-muted hover:text-text"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

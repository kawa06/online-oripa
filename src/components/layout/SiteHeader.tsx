import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { formatYen } from "@/lib/utils";
import { NotificationBell } from "@/components/layout/NotificationBell";

export async function SiteHeader() {
  const profile = await getSessionProfile().catch(() => null);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold gold-text">
          ORIPA VAULT
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/gacha" className="hover:text-text">
            ガチャ
          </Link>
          <Link href="/legal/buylist" className="hover:text-text">
            買取表
          </Link>
          <Link href="/contact" className="hover:text-text">
            お問い合わせ
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {profile ? (
            <>
              <NotificationBell />
              <span className="hidden sm:inline text-gold font-semibold">
                {formatYen(profile.points)} pt
              </span>
              <Link href="/mypage" className="btn-secondary py-2 px-3 text-xs">
                マイページ
              </Link>
              {profile.role === "ADMIN" && (
                <Link href="/admin" className="btn-secondary py-2 px-3 text-xs">
                  管理
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary py-2 px-3 text-xs">
                ログイン
              </Link>
              <Link href="/register" className="btn-primary py-2 px-3 text-xs">
                会員登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-bg-card">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <div className="flex flex-wrap gap-4">
          <Link href="/legal/terms">利用規約</Link>
          <Link href="/legal/privacy">プライバシーポリシー</Link>
          <Link href="/legal/tokusho">特定商取引法</Link>
          <Link href="/contact">お問い合わせ</Link>
        </div>
        <p className="mt-4">© 2026 ORIPA VAULT. All rights reserved.</p>
      </div>
    </footer>
  );
}

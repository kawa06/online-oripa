import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { formatPoints } from "@/lib/utils";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { MobileNavBar } from "@/components/layout/MobileNavBar";

export async function SiteHeader() {
  const profile = await getSessionProfile().catch(() => null);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="shrink-0 text-base font-bold gold-text sm:text-lg">
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
        <div className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
          {profile ? (
            <>
              <NotificationBell />
              <div className="min-w-0 text-right">
                <p className="text-[10px] leading-none text-muted sm:text-xs">Pコイン枚数</p>
                <p className="truncate text-xs font-semibold text-gold sm:text-sm">
                  {formatPoints(profile.points)}
                </p>
              </div>
              <Link href="/mypage" className="btn-secondary shrink-0 py-2 px-2 text-xs sm:px-3">
                マイページ
              </Link>
              {profile.role === "ADMIN" && (
                <Link href="/admin" className="btn-secondary shrink-0 py-2 px-2 text-xs sm:px-3">
                  管理
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary shrink-0 py-2 px-2 text-xs sm:px-3">
                ログイン
              </Link>
              <Link href="/register" className="btn-primary shrink-0 py-2 px-2 text-xs sm:px-3">
                会員登録
              </Link>
            </>
          )}
        </div>
      </div>
      <MobileNavBar />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-bg-card">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <div className="flex flex-wrap gap-4">
          <Link href="/gacha">ガチャ</Link>
          <Link href="/legal/buylist">買取表</Link>
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

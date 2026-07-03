import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { formatPoints, getStartOfTodayJST } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { LoginBonusCard } from "@/components/mypage/LoginBonusCard";
import { CouponRedeemForm } from "@/components/mypage/CouponRedeemForm";
import { ProfileSettings } from "@/components/mypage/ProfileSettings";
export default async function MypagePage() {
  const profile = await getSessionProfile().catch(() => null);
  if (!profile) redirect("/login");

  const todayStart = getStartOfTodayJST();
  const canClaimBonus = !profile.loginBonusLastAt || profile.loginBonusLastAt < todayStart;

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  const links = [
    { href: "/wins", label: "当選アイテム", desc: "保有中の景品を確認・変換・発送依頼" },
    { href: "/history", label: "ガチャ履歴", desc: "これまでの抽選履歴" },
    { href: "/shipping", label: "配送依頼", desc: "景品の発送を申し込む" },
    { href: "/shipping/history", label: "配送履歴", desc: "発送状況の確認" },
    { href: "/address", label: "住所登録", desc: "住所の登録・編集" },
    { href: "/points", label: "ポイント購入", desc: "ポイントをチャージ" },
    { href: "/purchases", label: "購入履歴", desc: "ポイント購入の履歴" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">マイページ</h1>
      <p className="mt-1 text-muted">{profile.email}</p>

      <div className="card-surface mt-6 p-6">
        <p className="text-sm text-muted">Pコイン枚数</p>
        <p className="mt-1 text-3xl font-bold gold-text">{formatPoints(profile.points)}</p>
        <Link href="/points" className="btn-primary mt-4 inline-flex text-sm">
          ポイントを購入
        </Link>
      </div>

      <LoginBonusCard canClaim={canClaimBonus} points={profile.points} />
      <CouponRedeemForm />
      <ProfileSettings phone={profile.phone} />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-surface p-4 transition hover:border-gold/40"
          >
            <p className="font-bold">{item.label}</p>
            <p className="mt-1 text-sm text-muted">{item.desc}</p>
          </Link>
        ))}
      </div>

      <form action={signOut} className="mt-8">
        <button type="submit" className="btn-secondary text-sm">
          ログアウト
        </button>
      </form>
    </div>
  );
}

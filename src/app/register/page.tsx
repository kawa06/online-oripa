"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { TimeoutError, withTimeout } from "@/lib/with-timeout";

const SIGNUP_TIMEOUT_MS = 20000;

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const { data, error: authError } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${appUrl}/auth/callback?next=/mypage`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        }),
        SIGNUP_TIMEOUT_MS,
        "auth.signUp",
      );

      if (authError) {
        setError(formatAuthError(authError, "登録に失敗しました。確認メールを送信できませんでした。"));
        return;
      }

      if (data.user && data.user.identities?.length === 0) {
        setMessage("このメールアドレスは登録済みの可能性があります。ログインするか、別のメールアドレスをお試しください。");
        return;
      }

      setMessage("確認メールを送信しました。メール内のリンクから登録を完了してください。");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      if (error instanceof TimeoutError) {
        setError(
          "登録処理がタイムアウトしました。Supabase の Send Email Hook を Delete し、Custom SMTP が ON か確認してください。",
        );
        return;
      }
      setError("登録に失敗しました。しばらくしてから再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const { error: authError } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${appUrl}/auth/callback?next=/mypage` },
        }),
        SIGNUP_TIMEOUT_MS,
        "auth.signInWithOAuth",
      );
      if (authError) setError(formatAuthError(authError, "Google登録に失敗しました。"));
    } catch (error) {
      if (error instanceof TimeoutError) {
        setError("Google登録がタイムアウトしました。ページを再読み込みしてお試しください。");
        return;
      }
      setError("Google登録に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">会員登録</h1>
      <p className="mt-2 text-sm text-muted">無料でアカウントを作成</p>

      <form onSubmit={handleSubmit} className="card-surface mt-8 space-y-4 p-6">
        {error && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        {message && <p className="rounded-lg bg-success/10 p-3 text-sm text-success">{message}</p>}

        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm text-muted">
            表示名
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-muted">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-muted">
            パスワード（8文字以上）
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            autoComplete="new-password"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "登録中..." : "登録する"}
        </button>
        <button type="button" disabled={loading} className="btn-secondary w-full" onClick={handleGoogle}>
          Googleで登録
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-gold">
          ログイン
        </Link>
      </p>
    </div>
  );
}

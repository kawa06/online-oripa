"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("確認メールを送信しました。メール内のリンクから登録を完了してください。");
    setTimeout(() => router.push("/login"), 3000);
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${appUrl}/auth/callback?next=/mypage` },
    });
    setLoading(false);
    if (authError) setError(authError.message);
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

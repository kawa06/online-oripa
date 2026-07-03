"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/mypage";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(false);
    if (authError) setError(authError.message);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <p className="mt-2 text-sm text-muted">メールアドレスとパスワード、またはGoogleでログイン</p>

      <form onSubmit={handleSubmit} className="card-surface mt-8 space-y-4 p-6">
        {error && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}

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
            パスワード
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "ログイン中..." : "ログイン"}
        </button>

        <button type="button" disabled={loading} className="btn-secondary w-full" onClick={handleGoogle}>
          Googleでログイン
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-muted">
        <p>
          <Link href="/forgot-password" className="text-gold">
            パスワードをお忘れですか？
          </Link>
        </p>
        <p>
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="text-gold">
            会員登録
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setMessage("パスワードリセット用のメールを送信しました。メールをご確認ください。");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">パスワードリセット</h1>
      <p className="mt-2 text-sm text-muted">登録メールアドレスにリセットリンクを送信します</p>

      <form onSubmit={handleSubmit} className="card-surface mt-8 space-y-4 p-6">
        {error && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        {message && <p className="rounded-lg bg-success/10 p-3 text-sm text-success">{message}</p>}

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

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "送信中..." : "リセットメールを送信"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="text-gold">
          ログインに戻る
        </Link>
      </p>
    </div>
  );
}

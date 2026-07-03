"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "送信に失敗しました");
      return;
    }

    setMessage("お問い合わせを送信しました。内容を確認のうえ、ご連絡いたします。");
    setForm({ name: "", email: "", subject: "", body: "" });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">お問い合わせ</h1>
      <p className="mt-2 text-muted">ご質問・ご要望はこちらからお送りください。</p>

      <form onSubmit={handleSubmit} className="card-surface mt-8 space-y-4 p-6">
        {error && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        {message && <p className="rounded-lg bg-success/10 p-3 text-sm text-success">{message}</p>}

        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-muted">
            お名前
          </label>
          <input
            id="name"
            required
            className="input-field"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="subject" className="mb-1 block text-sm text-muted">
            件名
          </label>
          <input
            id="subject"
            required
            className="input-field"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="body" className="mb-1 block text-sm text-muted">
            お問い合わせ内容
          </label>
          <textarea
            id="body"
            required
            rows={6}
            className="input-field resize-y"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "送信中..." : "送信する"}
        </button>
      </form>

      <Link href="/" className="mt-8 inline-block text-sm text-gold">
        ← トップページ
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileSettings({ phone }: { phone: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(phone ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: value }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "保存に失敗しました");
      return;
    }
    setMessage("電話番号を保存しました");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card-surface mt-6 p-6">
      <h2 className="font-bold">プロフィール設定</h2>
      <p className="mt-1 text-sm text-muted">本人確認・サポート連絡用の電話番号</p>
      <input
        className="input-field mt-4"
        placeholder="09012345678"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />
      {message && <p className="mt-3 text-sm text-success">{message}</p>}
      <button type="submit" className="btn-secondary mt-4 text-sm" disabled={loading}>
        {loading ? "保存中..." : "電話番号を保存"}
      </button>
    </form>
  );
}

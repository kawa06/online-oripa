"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPoints } from "@/lib/utils";

export function CouponRedeemForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/coupon/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "使用に失敗しました");
      return;
    }
    setMessage(`${data.code} で ${formatPoints(data.bonus)} を獲得しました`);
    setCode("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface mt-6 p-6">
      <h2 className="font-bold">クーポンコード</h2>
      <p className="mt-1 text-sm text-muted">お持ちのクーポンコードを入力してください</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input-field flex-1 font-mono uppercase"
          placeholder="WELCOME100"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit" className="btn-secondary shrink-0" disabled={loading}>
          {loading ? "確認中..." : "適用する"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {message && <p className="mt-3 text-sm text-success">{message}</p>}
    </form>
  );
}

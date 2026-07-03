"use client";

import Link from "next/link";
import { useState } from "react";
import { POINT_PACKAGES } from "@/lib/constants";
import { formatYen } from "@/lib/utils";

export default function PointsPage() {
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function checkout(points: number) {
    setLoading(points);
    setError("");
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? "決済の開始に失敗しました");
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">ポイント購入</h1>
      <p className="mt-2 text-muted">1ポイント = 1円相当。Stripeで安全にお支払いできます。</p>
      {error && <p className="mt-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {POINT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`card-surface relative p-6 ${pkg.points === 1000 ? "border-gold/50" : ""}`}
          >
            {pkg.points === 1000 && (
              <span className="absolute -top-2 right-4 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-black">
                人気
              </span>
            )}
            <p className="text-2xl font-bold gold-text">{pkg.name}</p>
            <p className="mt-2 text-muted">{formatYen(pkg.priceYen)}</p>
            <button
              type="button"
              onClick={() => checkout(pkg.points)}
              disabled={loading !== null}
              className="btn-primary mt-4 w-full"
            >
              {loading === pkg.points ? "処理中..." : "購入する"}
            </button>
          </div>
        ))}
      </div>
      <Link href="/mypage" className="mt-8 inline-block text-sm text-gold">
        ← マイページ
      </Link>
    </div>
  );
}

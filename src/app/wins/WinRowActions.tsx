"use client";

import { useState } from "react";
import type { PrizeRank, WinStatus } from "@prisma/client";

type Win = {
  id: string;
  name: string;
  imageUrl: string | null;
  rank: PrizeRank;
  pointValue: number;
  status: WinStatus;
};

export function WinRowActions({ win }: { win: Win }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function convertToPoints() {
    if (!confirm("この景品をポイントに変換しますか？")) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/wins/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winIds: [win.id] }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "変換に失敗しました");
      return;
    }
    window.location.reload();
  }

  if (win.status !== "HELD") return null;

  return (
    <div>
      {error && <p className="mb-2 text-xs text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={convertToPoints}
          disabled={loading}
          className="btn-secondary text-xs"
        >
          {loading ? "処理中..." : "ポイントに変換"}
        </button>
        <a href={`/shipping?winIds=${win.id}`} className="btn-primary text-xs">
          発送依頼
        </a>
      </div>
    </div>
  );
}

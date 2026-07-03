"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_BONUS_POINTS } from "@/lib/constants";

type Props = {
  canClaim: boolean;
  points: number;
};

export function LoginBonusCard({ canClaim, points }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPoints, setCurrentPoints] = useState(points);

  async function claim() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/login-bonus", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "取得に失敗しました");
      return;
    }
    if (data.claimed) {
      setCurrentPoints(data.points);
      setMessage(`${data.bonus}pt を受け取りました！`);
      router.refresh();
    } else {
      setMessage("本日のボーナスはすでに受け取り済みです");
    }
  }

  return (
    <div className="card-surface mt-6 p-6">
      <h2 className="font-bold">ログインボーナス</h2>
      <p className="mt-1 text-sm text-muted">毎日 {LOGIN_BONUS_POINTS}pt プレゼント</p>
      <p className="mt-3 text-sm text-muted">
        現在: <span className="font-bold text-gold">{currentPoints.toLocaleString()} pt</span>
      </p>
      {message && <p className="mt-3 text-sm text-success">{message}</p>}
      <button
        type="button"
        className="btn-primary mt-4 text-sm"
        onClick={claim}
        disabled={loading || !canClaim}
      >
        {loading ? "処理中..." : canClaim ? "ボーナスを受け取る" : "本日受取済み"}
      </button>
    </div>
  );
}

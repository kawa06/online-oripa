"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateUserMemo } from "@/app/admin/_actions";
import { formatPoints } from "@/lib/utils";
import type { PointTransaction, Profile } from "@prisma/client";

export function UserDetailPanel({
  user,
  transactions,
}: {
  user: Profile;
  transactions: PointTransaction[];
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState<"grant" | "deduct">("grant");
  const [description, setDescription] = useState("");
  const [memo, setMemo] = useState(user.adminMemo ?? "");
  const [loading, setLoading] = useState(false);

  async function handlePoints(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount, mode, description }),
    });
    setAmount(0);
    setDescription("");
    setLoading(false);
    router.refresh();
  }

  async function saveMemo() {
    await updateUserMemo(user.id, memo);
  }

  return (
    <div className="space-y-6">
      <div className="card-surface p-5">
        <h2 className="mb-3 font-bold">基本情報</h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">メール</dt><dd>{user.email}</dd></div>
          <div><dt className="text-muted">表示名</dt><dd>{user.displayName ?? "—"}</dd></div>
          <div><dt className="text-muted">電話</dt><dd>{user.phone ?? "—"}</dd></div>
          <div><dt className="text-muted">最終IP</dt><dd className="font-mono text-xs">{user.lastIp ?? "—"}</dd></div>
          <div><dt className="text-muted">ロール</dt><dd>{user.role}</dd></div>
          <div><dt className="text-muted">Pコイン枚数</dt><dd className="text-gold font-bold">{formatPoints(user.points)}</dd></div>
        </dl>
      </div>

      <form onSubmit={handlePoints} className="card-surface space-y-4 p-5">
        <h2 className="font-bold">ポイント付与 / 減算</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={mode === "grant" ? "btn-primary text-sm" : "btn-secondary text-sm"}
            onClick={() => setMode("grant")}
          >
            付与
          </button>
          <button
            type="button"
            className={mode === "deduct" ? "btn-primary text-sm" : "btn-secondary text-sm"}
            onClick={() => setMode("deduct")}
          >
            減算
          </button>
        </div>
        <input
          type="number"
          className="input-field"
          placeholder="ポイント数"
          value={amount || ""}
          min={1}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
        <input
          className="input-field"
          placeholder="理由（任意）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "処理中..." : "実行"}
        </button>
      </form>

      <div className="card-surface space-y-3 p-5">
        <h2 className="font-bold">管理者メモ</h2>
        <textarea
          className="input-field"
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        <button type="button" className="btn-secondary" onClick={saveMemo}>
          メモ保存
        </button>
      </div>

      <div className="card-surface table-scroll">
        <h2 className="border-b border-border p-4 font-bold">ポイント履歴</h2>
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated text-left text-muted">
            <tr>
              <th className="p-3">日時</th>
              <th className="p-3">種別</th>
              <th className="p-3">増減</th>
              <th className="p-3">残高</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-border/50">
                <td className="p-3 text-xs">{tx.createdAt.toLocaleString("ja-JP")}</td>
                <td className="p-3">{tx.type}</td>
                <td className={`p-3 ${tx.amount >= 0 ? "text-success" : "text-red-400"}`}>
                  {tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString()}
                </td>
                <td className="p-3">{tx.balanceAfter.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

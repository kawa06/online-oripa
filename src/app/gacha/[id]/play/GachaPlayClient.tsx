"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function GachaPlayClient() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const started = useRef(false);

  const countParam = searchParams.get("count");
  const count = countParam === "10" ? 10 : 1;

  const [phase, setPhase] = useState<"shake" | "flash" | "reveal" | "error">("shake");
  const [error, setError] = useState("");
  const [pullId, setPullId] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function pull() {
      try {
        const res = await fetch("/api/gacha/pull", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gachaId: id, count }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "ガチャに失敗しました");

        setPullId(data.pullId);
        await new Promise((r) => setTimeout(r, 1200));
        setPhase("flash");
        await new Promise((r) => setTimeout(r, 600));
        setPhase("reveal");
        await new Promise((r) => setTimeout(r, 900));
        router.replace(`/gacha/${id}/result?pullId=${data.pullId}`);
      } catch (e) {
        setPhase("error");
        setError(e instanceof Error ? e.message : "ガチャに失敗しました");
      }
    }

    pull();
  }, [id, count, router]);

  if (phase === "error") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="card-surface p-8">
          <p className="text-danger">{error}</p>
          <Link href={`/gacha/${id}`} className="btn-secondary mt-6 inline-flex">
            ガチャ詳細に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16">
      <div
        className={`card-surface flex aspect-square w-full max-w-xs items-center justify-center transition-all duration-500 ${
          phase === "shake" ? "gacha-shake gacha-glow" : ""
        } ${phase === "flash" ? "gacha-flash scale-105" : ""} ${phase === "reveal" ? "gacha-reveal border-gold/60" : ""}`}
      >
        <div className="text-center">
          <p className="text-4xl font-bold gold-text">ORIPA</p>
          <p className="mt-4 text-muted">
            {phase === "shake" && `${count}回 抽選中...`}
            {phase === "flash" && "結果判定中..."}
            {phase === "reveal" && "おめでとう！"}
          </p>
          {pullId && phase === "reveal" && (
            <p className="mt-2 text-xs text-gold">結果画面へ移動します</p>
          )}
        </div>
      </div>
      <p className="mt-8 animate-pulse text-sm text-muted">しばらくお待ちください</p>
    </div>
  );
}

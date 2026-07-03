"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import {
  buildRevealSequence,
  pickTopRank,
  toEffectRank,
  type EffectRank,
} from "@/lib/gacha/rankEffects";
import { stopAllGachaSounds } from "@/lib/gacha/soundManager";
import { RankEffectScene } from "./RankEffectScene";
import { ResultRevealPanel, type PullResultItem } from "./ResultRevealPanel";

type Phase = "pulling" | "effect" | "result" | "error";

type Props = {
  gachaId: string;
  count: 1 | 10;
};

export function GachaRevealExperience({ gachaId, count }: Props) {
  const started = useRef(false);
  const serverResults = useRef<PullResultItem[] | null>(null);
  const actualRank = useRef<EffectRank>("LOSE");

  const [phase, setPhase] = useState<Phase>("pulling");
  const [error, setError] = useState("");
  const [sequence, setSequence] = useState<EffectRank[]>([]);
  const [seqIndex, setSeqIndex] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [displayResults, setDisplayResults] = useState<PullResultItem[]>([]);

  const runPull = useCallback(async () => {
    const res = await fetch("/api/gacha/pull", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gachaId, count }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "ガチャに失敗しました");

    const results: PullResultItem[] = (data.wins ?? []).map(
      (w: {
        id: string;
        rank: string;
        name: string;
        imageUrl: string | null;
        pointValue: number;
      }) => ({
        winId: w.id,
        rank: w.rank,
        name: w.name,
        imageUrl: w.imageUrl,
        pointValue: w.pointValue,
      })
    );

    serverResults.current = results;
    const top = pickTopRank(results.map((r) => toEffectRank(r.rank)));
    actualRank.current = top;
    setSequence(buildRevealSequence(top));
    setDisplayResults(results);
    setSeqIndex(0);
    setPhase("effect");
  }, [gachaId, count]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runPull().catch((e) => {
      setPhase("error");
      setError(e instanceof Error ? e.message : "ガチャに失敗しました");
    });
    return () => stopAllGachaSounds();
  }, [runPull]);

  const handleSkip = () => {
    setSkipped(true);
    stopAllGachaSounds();
    setPhase("result");
  };

  const handleEffectComplete = () => {
    if (skipped) return;
    if (seqIndex < sequence.length - 1) {
      setSeqIndex((i) => i + 1);
      return;
    }
    stopAllGachaSounds();
    setPhase("result");
  };

  if (phase === "error") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="card-surface p-8">
          <p className="text-danger">{error}</p>
          <Link href={`/gacha/${gachaId}`} className="btn-secondary mt-6 inline-flex">
            ガチャ詳細に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "pulling") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16">
        <div className="card-surface flex aspect-square w-full max-w-xs animate-pulse items-center justify-center">
          <p className="text-muted">抽選中...</p>
        </div>
        <p className="mt-6 text-sm text-muted">サーバーで結果を確定しています</p>
      </div>
    );
  }

  const currentRank = sequence[seqIndex];
  const nextRank = seqIndex < sequence.length - 1 ? sequence[seqIndex + 1] : null;

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {phase === "effect" && currentRank && (
          <RankEffectScene
            key={`${currentRank}-${seqIndex}`}
            rank={currentRank}
            isUpgradePhase={seqIndex === 0 && sequence.length > 1}
            nextRank={nextRank}
            onComplete={handleEffectComplete}
            skipped={skipped}
          />
        )}
      </AnimatePresence>

      {phase === "effect" && (
        <button
          type="button"
          onClick={handleSkip}
          className="fixed bottom-6 right-6 z-[60] rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm text-white backdrop-blur hover:bg-black/70"
        >
          スキップ »
        </button>
      )}

      {phase === "result" && displayResults.length > 0 && (
        <ResultRevealPanel
          gachaId={gachaId}
          results={displayResults}
          topRank={actualRank.current}
        />
      )}
    </div>
  );
}

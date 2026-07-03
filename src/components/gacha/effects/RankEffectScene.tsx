"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  RANK_EFFECTS,
  getUpgradeMessage,
  type EffectRank,
} from "@/lib/gacha/rankEffects";
import { playRankSounds } from "@/lib/gacha/soundManager";
import { EffectParticles } from "./EffectParticles";

type Props = {
  rank: EffectRank;
  isUpgradePhase: boolean;
  nextRank: EffectRank | null;
  onComplete: () => void;
  skipped: boolean;
};

function ConfettiLayer({ type }: { type: "gold" | "redGold" | "none" }) {
  if (type === "none") return null;
  const colors = type === "gold" ? ["#ffd700", "#fff8dc", "#daa520"] : ["#ff4444", "#ffd700", "#ffffff"];
  return (
    <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute block h-2 w-1 rounded-sm"
          style={{
            left: `${(i * 13) % 100}%`,
            backgroundColor: colors[i % colors.length],
          }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: 2.2 + (i % 5) * 0.2, delay: i * 0.04, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function RankEffectScene({ rank, isUpgradePhase, nextRank, onComplete, skipped }: Props) {
  const config = RANK_EFFECTS[rank];
  const [countdown, setCountdown] = useState(config.countdown ? 3 : 0);
  const [kiriIndex, setKiriIndex] = useState(0);
  const [blackout, setBlackout] = useState(config.blackoutStart);

  useEffect(() => {
    if (skipped) {
      onComplete();
      return;
    }
    playRankSounds(config);

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (config.blackoutStart) {
      timers.push(setTimeout(() => setBlackout(false), 500));
    }

    if (config.countdown) {
      let c = 3;
      const tick = () => {
        if (cancelled) return;
        setCountdown(c);
        if (c > 0) {
          c -= 1;
          timers.push(setTimeout(tick, 700));
        }
      };
      timers.push(setTimeout(tick, 600));
    }

    if (config.kiriNumbers?.length) {
      let i = 0;
      const cycle = () => {
        if (cancelled) return;
        setKiriIndex(i % config.kiriNumbers!.length);
        i += 1;
        timers.push(setTimeout(cycle, 450));
      };
      timers.push(setTimeout(cycle, 800));
    }

    timers.push(
      setTimeout(() => {
        if (!cancelled) onComplete();
      }, config.durationMs)
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [rank, skipped, config, onComplete]);

  const upgradeMsg =
    isUpgradePhase && nextRank ? getUpgradeMessage(rank, nextRank) : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: config.backgroundGradient }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {blackout && (
          <motion.div
            className="absolute inset-0 z-[5] bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          />
        )}
      </AnimatePresence>

      <EffectParticles config={config} active={!skipped} />
      <ConfettiLayer type={config.confetti} />

      {config.rank === "KIRI" && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[3] opacity-60"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 42px)",
          }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
      )}

      {config.lightning && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[3] bg-white mix-blend-overlay"
          animate={{ opacity: [0, 0.7, 0, 0.5, 0] }}
          transition={{ duration: 0.35, repeat: config.rank === "S" || config.rank === "LAST_ONE" ? 4 : 2, repeatDelay: 0.45 }}
        />
      )}

      {config.screenShake && (
        <motion.div
          className="absolute inset-0 z-[1]"
          animate={{ x: [0, -6, 8, -4, 5, 0], y: [0, 4, -5, 3, -2, 0] }}
          transition={{ duration: 0.5, repeat: 3, repeatDelay: 0.3 }}
        />
      )}

      <motion.div
        className="relative z-[6] flex flex-col items-center px-4"
        animate={
          config.cameraZoom
            ? { scale: [0.7, 1.15, 1], filter: ["blur(4px)", "blur(0px)"] }
            : { scale: 1 }
        }
        transition={{ duration: config.slowMotion ? 1.4 : 0.8, ease: "easeOut" }}
      >
        {config.countdown && countdown > 0 && (
          <motion.p
            key={countdown}
            className="mb-4 text-6xl font-black text-white drop-shadow-lg"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            {countdown}
          </motion.p>
        )}

        {config.kiriNumbers && (
          <motion.p
            key={kiriIndex}
            className="mb-2 text-5xl font-black tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
          >
            {config.kiriNumbers[kiriIndex]}
          </motion.p>
        )}

        {config.headline && (
          <motion.h2
            className="text-center text-4xl font-black tracking-wide md:text-6xl"
            style={{
              color: config.glowColor,
              textShadow: `0 0 30px ${config.glowColor}, 0 0 60px ${config.glowColor}`,
            }}
            initial={{ y: 30, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: config.blackoutStart ? 0.6 : 0.2, type: "spring", stiffness: 120 }}
          >
            {config.headline}
          </motion.h2>
        )}

        {!config.headline && config.label && (
          <motion.p
            className="mt-2 text-2xl font-bold text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {config.label}
          </motion.p>
        )}

        <motion.div
          className="mt-8 flex h-40 w-28 items-center justify-center rounded-xl border-2 bg-black/30 backdrop-blur-sm md:h-52 md:w-36"
          style={{ borderColor: config.glowColor, boxShadow: `0 0 40px ${config.glowColor}` }}
          animate={{
            rotate: config.cardRotation,
            scale: config.cardScale,
          }}
          transition={{
            duration: config.durationMs / 1000,
            ease: config.slowMotion ? [0.2, 0.8, 0.2, 1] : "easeInOut",
          }}
        >
          <span className="text-sm font-bold text-white/70">?</span>
        </motion.div>

        {upgradeMsg && (
          <motion.p
            className="mt-6 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1], y: 0 }}
          >
            {upgradeMsg}
          </motion.p>
        )}

        {isUpgradePhase && nextRank && (
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: config.durationMs / 1000 - 0.6, duration: 0.5 }}
          >
            <span className="text-5xl font-black text-white drop-shadow-lg">!?</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

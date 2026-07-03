export type EffectRank = "NONE" | "LOSE" | "C" | "B" | "A" | "S" | "LAST_ONE" | "KIRI";

export type RankEffectConfig = {
  rank: EffectRank;
  label: string;
  durationMs: number;
  background: string;
  backgroundGradient: string;
  glowColor: string;
  particlePreset: "none" | "stars" | "sparkle" | "gold" | "rainbow" | "redGold";
  cardRotation: number;
  cardScale: number;
  slowMotion: boolean;
  screenShake: boolean;
  lightning: boolean;
  blackoutStart: boolean;
  countdown: boolean;
  headline: string | null;
  kiriNumbers: string[] | null;
  confetti: "none" | "gold" | "redGold";
  cameraZoom: boolean;
  upgradeHint: "rainbow" | "lightning" | "gold" | "surprise" | null;
  sound: {
    bgm: "soft" | "pulse" | "epic" | "lastOne" | "kiri" | null;
    reveal: "tap" | "chime" | "thunder" | "fanfare" | "kiri" | null;
  };
};

/** 演出の強さ順（昇格判定用） */
export const RANK_STRENGTH_ORDER: EffectRank[] = [
  "NONE",
  "LOSE",
  "C",
  "B",
  "A",
  "S",
  "LAST_ONE",
  "KIRI",
];

export const RANK_EFFECTS: Record<EffectRank, RankEffectConfig> = {
  NONE: {
    rank: "NONE",
    label: "",
    durationMs: 1500,
    background: "#1a1a1f",
    backgroundGradient: "linear-gradient(160deg, #1a1a1f 0%, #2a2a32 100%)",
    glowColor: "rgba(255,255,255,0.35)",
    particlePreset: "none",
    cardRotation: 0,
    cardScale: 0.92,
    slowMotion: false,
    screenShake: false,
    lightning: false,
    blackoutStart: false,
    countdown: false,
    headline: null,
    kiriNumbers: null,
    confetti: "none",
    cameraZoom: false,
    upgradeHint: null,
    sound: { bgm: null, reveal: "tap" },
  },
  LOSE: {
    rank: "LOSE",
    label: "",
    durationMs: 1500,
    background: "#1a1a1f",
    backgroundGradient: "linear-gradient(160deg, #1a1a1f 0%, #2a2a32 100%)",
    glowColor: "rgba(255,255,255,0.4)",
    particlePreset: "none",
    cardRotation: 0,
    cardScale: 0.92,
    slowMotion: false,
    screenShake: false,
    lightning: false,
    blackoutStart: false,
    countdown: false,
    headline: null,
    kiriNumbers: null,
    confetti: "none",
    cameraZoom: false,
    upgradeHint: null,
    sound: { bgm: null, reveal: "tap" },
  },
  C: {
    rank: "C",
    label: "C賞",
    durationMs: 2000,
    background: "#0c1a3a",
    backgroundGradient: "linear-gradient(160deg, #0c1a3a 0%, #1e3a8a 50%, #0c1a3a 100%)",
    glowColor: "rgba(96,165,250,0.7)",
    particlePreset: "stars",
    cardRotation: 360,
    cardScale: 1,
    slowMotion: false,
    screenShake: false,
    lightning: false,
    blackoutStart: false,
    countdown: false,
    headline: null,
    kiriNumbers: null,
    confetti: "none",
    cameraZoom: false,
    upgradeHint: "rainbow",
    sound: { bgm: "soft", reveal: "chime" },
  },
  B: {
    rank: "B",
    label: "B賞",
    durationMs: 2500,
    background: "#052e16",
    backgroundGradient: "linear-gradient(160deg, #052e16 0%, #166534 50%, #052e16 100%)",
    glowColor: "rgba(74,222,128,0.75)",
    particlePreset: "sparkle",
    cardRotation: 540,
    cardScale: 1.05,
    slowMotion: false,
    screenShake: true,
    lightning: false,
    blackoutStart: false,
    countdown: false,
    headline: null,
    kiriNumbers: null,
    confetti: "none",
    cameraZoom: false,
    upgradeHint: "lightning",
    sound: { bgm: "pulse", reveal: "chime" },
  },
  A: {
    rank: "A",
    label: "A賞",
    durationMs: 3000,
    background: "#2e1065",
    backgroundGradient: "linear-gradient(160deg, #2e1065 0%, #7c3aed 45%, #2e1065 100%)",
    glowColor: "rgba(192,132,252,0.85)",
    particlePreset: "sparkle",
    cardRotation: 720,
    cardScale: 1.1,
    slowMotion: true,
    screenShake: false,
    lightning: true,
    blackoutStart: false,
    countdown: false,
    headline: null,
    kiriNumbers: null,
    confetti: "none",
    cameraZoom: false,
    upgradeHint: "gold",
    sound: { bgm: "pulse", reveal: "thunder" },
  },
  S: {
    rank: "S",
    label: "S賞!!",
    durationMs: 4000,
    background: "#3d2f00",
    backgroundGradient: "linear-gradient(160deg, #1a1200 0%, #b8860b 40%, #ffd700 70%, #1a1200 100%)",
    glowColor: "rgba(255,215,0,0.95)",
    particlePreset: "gold",
    cardRotation: 900,
    cardScale: 1.2,
    slowMotion: true,
    screenShake: true,
    lightning: true,
    blackoutStart: true,
    countdown: false,
    headline: "S賞!!",
    kiriNumbers: null,
    confetti: "gold",
    cameraZoom: true,
    upgradeHint: "surprise",
    sound: { bgm: "epic", reveal: "fanfare" },
  },
  LAST_ONE: {
    rank: "LAST_ONE",
    label: "LAST ONE",
    durationMs: 5000,
    background: "#3b0000",
    backgroundGradient: "linear-gradient(160deg, #1a0000 0%, #dc2626 35%, #ffd700 65%, #1a0000 100%)",
    glowColor: "rgba(255,80,80,0.9)",
    particlePreset: "redGold",
    cardRotation: 1080,
    cardScale: 1.25,
    slowMotion: true,
    screenShake: true,
    lightning: true,
    blackoutStart: true,
    countdown: true,
    headline: "LAST ONE",
    kiriNumbers: null,
    confetti: "redGold",
    cameraZoom: true,
    upgradeHint: null,
    sound: { bgm: "lastOne", reveal: "fanfare" },
  },
  KIRI: {
    rank: "KIRI",
    label: "キリ番!!",
    durationMs: 5500,
    background: "#1a1035",
    backgroundGradient: "linear-gradient(135deg, #ff0080, #ff8c00, #ffd700, #00ff87, #00c8ff, #8b5cf6, #ff0080)",
    glowColor: "rgba(255,255,255,0.95)",
    particlePreset: "rainbow",
    cardRotation: 1260,
    cardScale: 1.3,
    slowMotion: true,
    screenShake: true,
    lightning: false,
    blackoutStart: true,
    countdown: false,
    headline: "キリ番!!",
    kiriNumbers: ["777", "1000", "5000"],
    confetti: "none",
    cameraZoom: true,
    upgradeHint: null,
    sound: { bgm: "kiri", reveal: "kiri" },
  },
};

export function toEffectRank(rank: string | null | undefined): EffectRank {
  if (!rank) return "NONE";
  if (rank in RANK_EFFECTS) return rank as EffectRank;
  return "LOSE";
}

export function rankStrength(rank: EffectRank): number {
  return RANK_STRENGTH_ORDER.indexOf(rank);
}

export function pickTopRank(ranks: EffectRank[]): EffectRank {
  return ranks.reduce((best, r) => (rankStrength(r) > rankStrength(best) ? r : best), "LOSE");
}

/** 見た目だけの昇格演出シーケンス（最終ランクはサーバー結果） */
export function buildRevealSequence(actual: EffectRank): EffectRank[] {
  const idx = rankStrength(actual);
  if (idx <= rankStrength("LOSE")) return [actual === "NONE" ? "LOSE" : actual];
  if (actual === "LAST_ONE" || actual === "KIRI") return ["S", actual];
  const startIdx = Math.max(rankStrength("C"), idx - 1);
  const start = RANK_STRENGTH_ORDER[startIdx];
  if (start === actual) return [actual];
  return [start, actual];
}

export function getUpgradeMessage(from: EffectRank, to: EffectRank): string | null {
  if (from === "C" && to === "B") return "虹が走って昇格!!";
  if (from === "B" && to === "A") return "雷が落ちて昇格!!";
  if (from === "A" && to === "S") return "金色に変化!!";
  if (from === "S" && (to === "LAST_ONE" || to === "KIRI")) return "!? 超激レア!!";
  if (rankStrength(to) > rankStrength(from)) return "ランクアップ!!";
  return null;
}

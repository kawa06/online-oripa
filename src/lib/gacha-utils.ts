export type PrizeRankKey = "S" | "A" | "B" | "C" | "LOSE" | "LAST_ONE" | "KIRI";

const RANK_LABELS: Record<PrizeRankKey, string> = {
  S: "S賞",
  A: "A賞",
  B: "B賞",
  C: "C賞",
  LOSE: "ハズレ",
  LAST_ONE: "ラストワン",
  KIRI: "キリ番",
};

export function rankLabel(rank: PrizeRankKey | string) {
  return RANK_LABELS[rank as PrizeRankKey] ?? rank;
}

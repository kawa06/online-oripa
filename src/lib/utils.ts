export function formatYen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export function calcGachaMetrics(
  totalSlots: number,
  pricePerPull: number,
  prizes: { quantity: number; marketPrice: number; costPrice: number }[]
) {
  const totalRevenue = totalSlots * pricePerPull;
  const totalCost = prizes.reduce((s, p) => s + p.quantity * p.costPrice, 0);
  const totalPrizeValue = prizes.reduce((s, p) => s + p.quantity * p.marketPrice, 0);
  const profit = totalRevenue - totalCost;
  const returnRate = totalRevenue > 0 ? (totalPrizeValue / totalRevenue) * 100 : 0;
  return { totalRevenue, totalCost, totalPrizeValue, profit, returnRate };
}

export function generateCode(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/** JST 0:00 を UTC Date として返す（DB比較用） */
export function getStartOfTodayJST() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return new Date(`${y}-${m}-${d}T00:00:00+09:00`);
}

export async function lookupAddressByZipcode(zip: string) {
  const cleaned = zip.replace(/-/g, "");
  if (!/^\d{7}$/.test(cleaned)) return null;
  const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleaned}`);
  const data = await res.json();
  if (data.status !== 200 || !data.results?.[0]) return null;
  const r = data.results[0];
  return {
    prefecture: r.address1 as string,
    city: `${r.address2}${r.address3}` as string,
  };
}

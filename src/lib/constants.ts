export const LOGIN_BONUS_POINTS = 100;

export const POINT_PACKAGES = [
  { id: "pkg_500", points: 500, priceYen: 550, name: "500 Pコイン" },
  { id: "pkg_1000", points: 1000, priceYen: 1100, name: "1,000 Pコイン" },
  { id: "pkg_3000", points: 3000, priceYen: 3300, name: "3,000 Pコイン" },
  { id: "pkg_5000", points: 5000, priceYen: 5500, name: "5,000 Pコイン" },
  { id: "pkg_10000", points: 10000, priceYen: 11000, name: "10,000 Pコイン" },
] as const;

export const SHIPPING_STATUSES = [
  "PENDING",
  "UNCONFIRMED",
  "PACKING",
  "READY",
  "SHIPPED",
  "CONTACTED",
] as const;

export const LOW_STOCK_THRESHOLD = 3;

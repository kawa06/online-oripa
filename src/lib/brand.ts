/** カードショップ名・連絡先（メール・フッター等で共通利用） */
export function getShopName() {
  return process.env.SHOP_NAME ?? "ORIPA VAULT";
}

export function getContactEmail() {
  return process.env.CONTACT_EMAIL ?? process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] ?? "support@example.com";
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

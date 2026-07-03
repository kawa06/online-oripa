import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");

function looksLikeGmailAppPassword(value) {
  const compact = value.replace(/\s/g, "");
  return compact.length === 16 && /^[a-z]{16}$/i.test(compact);
}

function looksLikeSupabaseToken(value) {
  return value.startsWith("sbp_") && value.length > 20;
}

function setEnvValue(content, key, value) {
  const line = `${key}=${value.includes(" ") ? `"${value}"` : value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  return re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

if (!existsSync(envPath)) {
  console.error("✗ .env.local が見つかりません");
  process.exit(1);
}

let token = (process.argv[2] ?? process.env.SUPABASE_ACCESS_TOKEN ?? "").trim();
let gmail = (process.argv[3] ?? process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s/g, "");

if (token && looksLikeGmailAppPassword(token) && !gmail) {
  gmail = token.replace(/\s/g, "");
  token = "";
  console.log("⚠ Token 欄に Gmail パスワードが入っていました → GMAIL_APP_PASSWORD に移しました");
}

if (gmail && looksLikeSupabaseToken(gmail) && !looksLikeSupabaseToken(token)) {
  token = gmail;
  gmail = "";
  console.log("⚠ Gmail 欄に Supabase トークンが入っていました → SUPABASE_ACCESS_TOKEN に移しました");
}

if (token && !looksLikeSupabaseToken(token)) {
  console.error("✗ Supabase Token は sbp_ で始まる必要があります");
  process.exit(1);
}

if (gmail && !looksLikeGmailAppPassword(gmail)) {
  console.error("✗ Gmail アプリパスワードは16文字である必要があります");
  process.exit(1);
}

let content = readFileSync(envPath, "utf8");
if (token) content = setEnvValue(content, "SUPABASE_ACCESS_TOKEN", token);
if (gmail) content = setEnvValue(content, "GMAIL_APP_PASSWORD", gmail);
writeFileSync(envPath, content, "utf8");

console.log("✓ .env.local に保存しました");
if (token) console.log("  SUPABASE_ACCESS_TOKEN: OK");
if (gmail) console.log("  GMAIL_APP_PASSWORD: OK");

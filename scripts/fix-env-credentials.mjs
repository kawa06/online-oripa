import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");

if (!existsSync(envPath)) {
  console.error("✗ .env.local が見つかりません");
  process.exit(1);
}

function parseEnv(content) {
  const lines = content.split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

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

let content = readFileSync(envPath, "utf8");
const env = parseEnv(content);
let changed = false;

const token = env.SUPABASE_ACCESS_TOKEN ?? "";
const gmailPass = env.GMAIL_APP_PASSWORD ?? "";

if (!gmailPass && token && looksLikeGmailAppPassword(token)) {
  const fixed = token.replace(/\s/g, "");
  content = setEnvValue(content, "GMAIL_APP_PASSWORD", fixed);
  content = setEnvValue(content, "SUPABASE_ACCESS_TOKEN", "");
  changed = true;
  console.log("✓ 入れ違いを修正: Gmail パスワード → GMAIL_APP_PASSWORD");
  console.log("  SUPABASE_ACCESS_TOKEN は空にしました（sbp_ トークンを設定してください）");
}

if (gmailPass && looksLikeSupabaseToken(gmailPass) && !looksLikeSupabaseToken(token)) {
  content = setEnvValue(content, "SUPABASE_ACCESS_TOKEN", gmailPass);
  content = setEnvValue(content, "GMAIL_APP_PASSWORD", "");
  changed = true;
  console.log("✓ 入れ違いを修正: Supabase トークン → SUPABASE_ACCESS_TOKEN");
}

const updated = parseEnv(changed ? content : readFileSync(envPath, "utf8"));
if (updated.GMAIL_APP_PASSWORD) {
  const compact = updated.GMAIL_APP_PASSWORD.replace(/\s/g, "");
  if (compact !== updated.GMAIL_APP_PASSWORD) {
    content = setEnvValue(content, "GMAIL_APP_PASSWORD", compact);
    changed = true;
    console.log("✓ GMAIL_APP_PASSWORD からスペースを削除しました");
  }
}

if (changed) {
  writeFileSync(envPath, content, "utf8");
}

const finalEnv = parseEnv(readFileSync(envPath, "utf8"));
const tokenOk = looksLikeSupabaseToken(finalEnv.SUPABASE_ACCESS_TOKEN ?? "");
const gmailOk = looksLikeGmailAppPassword(finalEnv.GMAIL_APP_PASSWORD ?? "");

console.log("\n=== 現在の状態 ===");
console.log(`${tokenOk ? "✓" : "✗"} SUPABASE_ACCESS_TOKEN${tokenOk ? "" : " — sbp_ で始まるトークンが必要"}`);
console.log(`${gmailOk ? "✓" : "✗"} GMAIL_APP_PASSWORD${gmailOk ? "" : " — 16文字のアプリパスワードが必要"}`);

if (!tokenOk) {
  console.log("\nSupabase Token を発行:");
  console.log("  https://supabase.com/dashboard/account/tokens");
  console.log("  → Generate new token → .env.local の SUPABASE_ACCESS_TOKEN= に貼る");
  process.exit(1);
}

if (!gmailOk) {
  process.exit(1);
}

console.log("\n✓ .env.local の認証情報は正しい形式です");

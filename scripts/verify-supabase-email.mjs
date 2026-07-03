import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const envPath = join(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
  console.error("NG: .env.local が見つかりません");
  process.exit(1);
}

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "SUPABASE_ACCESS_TOKEN",
];

const optional = [
  "NEXT_PUBLIC_APP_URL",
  "SHOP_NAME",
  "CONTACT_EMAIL",
  "SUPABASE_EMAIL_RATE_LIMIT",
];

function isPlaceholder(value) {
  if (!value) return true;
  return /your-|YOUR_|xxxx|\.\.\./i.test(value);
}

console.log("=== .env.local チェック ===\n");

let envOk = true;
for (const key of required) {
  const value = process.env[key] ?? "";
  const ok = value.length > 0 && !isPlaceholder(value);
  if (!ok) envOk = false;
  console.log(`${ok ? "✓" : "✗"} ${key}${ok ? "" : " — 未設定またはプレースホルダ"}`);
}

for (const key of optional) {
  const value = process.env[key];
  console.log(`${value ? "✓" : "·"} ${key}${value ? `: ${value}` : " — 未設定（デフォルト使用）"}`);
}

const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(
  /https:\/\/([^.]+)\.supabase\.co/,
)?.[1];

if (!projectRef) {
  console.error("\n✗ NEXT_PUBLIC_SUPABASE_URL からプロジェクト ref を取得できません");
  process.exit(1);
}

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
if (!accessToken || isPlaceholder(accessToken)) {
  console.log("\n--- Supabase API 確認をスキップ（SUPABASE_ACCESS_TOKEN 未設定）---");
  process.exit(envOk ? 0 : 1);
}

const authConfigUrl = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;
const res = await fetch(authConfigUrl, {
  headers: { Authorization: `Bearer ${accessToken}` },
});

if (!res.ok) {
  console.error(`\n✗ Supabase API エラー: ${res.status}`);
  console.error(await res.text());
  process.exit(1);
}

const c = await res.json();
const gmailUser = process.env.GMAIL_USER ?? "";
const expectedRateLimit = Number(process.env.SUPABASE_EMAIL_RATE_LIMIT ?? "100");
const expectedAppUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://online-oripa.onrender.com").replace(/\/$/, "");

console.log("\n=== Supabase Auth 設定（API 取得） ===\n");

const checks = [
  {
    label: "Send Email Hook が OFF",
    ok: !c.hook_send_email_enabled,
    detail: c.hook_send_email_enabled ? `URI: ${c.hook_send_email_uri || "(empty)"}` : "",
  },
  {
    label: "Custom SMTP（Gmail）が ON",
    ok: c.external_email_enabled === true,
  },
  {
    label: "SMTP ホスト = smtp.gmail.com",
    ok: c.smtp_host === "smtp.gmail.com",
    detail: c.smtp_host,
  },
  {
    label: "SMTP ポート = 587",
    ok: c.smtp_port === 587,
    detail: String(c.smtp_port),
  },
  {
    label: "SMTP ユーザー = GMAIL_USER",
    ok: c.smtp_user === gmailUser,
    detail: c.smtp_user,
  },
  {
    label: "送信者名が設定済み",
    ok: Boolean(c.smtp_sender_name),
    detail: c.smtp_sender_name,
  },
  {
    label: `Emails sent 上限 = ${expectedRateLimit}`,
    ok: c.rate_limit_email_sent === expectedRateLimit,
    detail: `現在: ${c.rate_limit_email_sent ?? "(未設定)"}`,
  },
  {
    label: "Site URL が設定済み",
    ok: Boolean(c.site_url),
    detail: c.site_url,
  },
  {
    label: `Site URL = ${expectedAppUrl}`,
    ok: (c.site_url ?? "").replace(/\/$/, "") === expectedAppUrl,
    detail: c.site_url,
  },
  {
    label: "メール確認が必要（autoconfirm OFF）",
    ok: c.mailer_autoconfirm === false,
  },
];

let supabaseOk = true;
for (const { label, ok, detail } of checks) {
  if (!ok) supabaseOk = false;
  const suffix = detail ? ` (${detail})` : "";
  console.log(`${ok ? "✓" : "✗"} ${label}${suffix}`);
}

const redirects = String(c.uri_allow_list ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

console.log("\n=== Redirect URLs ===");
for (const url of redirects) {
  console.log(`  · ${url}`);
}

const needsCallback = [`${expectedAppUrl}/auth/callback`, "http://localhost:3000/auth/callback"];
for (const url of needsCallback) {
  const ok = redirects.includes(url);
  if (!ok) supabaseOk = false;
  console.log(`${ok ? "✓" : "✗"} ${url}${ok ? "" : " — 未登録"}`);
}

console.log("\n=== ダッシュボードリンク ===");
console.log(`  Hooks:       https://supabase.com/dashboard/project/${projectRef}/auth/hooks`);
console.log(`  SMTP:        https://supabase.com/dashboard/project/${projectRef}/auth/smtp`);
console.log(`  Rate Limits: https://supabase.com/dashboard/project/${projectRef}/auth/rate-limits`);
console.log(`  Templates:   https://supabase.com/dashboard/project/${projectRef}/auth/templates`);

if (envOk && supabaseOk) {
  console.log("\n✓ すべての設定が正しく反映されています");
  process.exit(0);
}

console.log("\n✗ 一部の設定に問題があります。上記の ✗ を確認してください。");
process.exit(1);

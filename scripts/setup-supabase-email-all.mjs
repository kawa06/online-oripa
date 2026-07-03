import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { loadEnvLocal } from "./lib/load-env.mjs";
import { getShopNameFromEnv, getContactEmailFromEnv, getSupabaseEmailTemplates } from "./lib/email-templates.mjs";

loadEnvLocal();

function looksLikeGmailAppPassword(value) {
  const compact = value.replace(/\s/g, "");
  return compact.length === 16 && /^[a-z]{16}$/i.test(compact);
}

function looksLikeSupabaseToken(value) {
  return value.startsWith("sbp_") && value.length > 20;
}

function upsertEnvLocal(updates) {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  let content = readFileSync(path, "utf8");
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    const line = `${key}=${value.includes(" ") ? `"${value}"` : value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
  }
  writeFileSync(path, content, "utf8");
}

let accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim() ?? "";
let gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "") ?? "";

if (!gmailPass && accessToken && looksLikeGmailAppPassword(accessToken)) {
  gmailPass = accessToken.replace(/\s/g, "");
  accessToken = "";
  upsertEnvLocal({ GMAIL_APP_PASSWORD: gmailPass, SUPABASE_ACCESS_TOKEN: "" });
  console.log("⚠ 入れ違いを検出: Gmail パスワードを GMAIL_APP_PASSWORD に移しました");
  console.log("  SUPABASE_ACCESS_TOKEN に sbp_ トークンを設定して再実行してください\n");
}

if (gmailPass && looksLikeSupabaseToken(gmailPass) && !looksLikeSupabaseToken(accessToken)) {
  accessToken = gmailPass;
  gmailPass = "";
  upsertEnvLocal({ SUPABASE_ACCESS_TOKEN: accessToken, GMAIL_APP_PASSWORD: "" });
  console.log("⚠ 入れ違いを検出: Supabase トークンを SUPABASE_ACCESS_TOKEN に移しました\n");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const gmailUser = (process.env.GMAIL_USER ?? "oripakawa@gmail.com").trim();
const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://online-oripa.onrender.com").replace(/\/$/, "");
const shopName = getShopNameFromEnv();
const contactEmail = getContactEmailFromEnv();
const emailRateLimit = Number(process.env.SUPABASE_EMAIL_RATE_LIMIT ?? "100");

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

const links = projectRef
  ? {
      tokens: "https://supabase.com/dashboard/account/tokens",
      appPasswords: "https://myaccount.google.com/apppasswords",
      hooks: `https://supabase.com/dashboard/project/${projectRef}/auth/hooks`,
      smtp: `https://supabase.com/dashboard/project/${projectRef}/auth/smtp`,
      rateLimits: `https://supabase.com/dashboard/project/${projectRef}/auth/rate-limits`,
      templates: `https://supabase.com/dashboard/project/${projectRef}/auth/templates`,
      urlConfig: `https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration`,
      users: `https://supabase.com/dashboard/project/${projectRef}/auth/users`,
      register: `${appUrl}/register`,
    }
  : null;

function openBrowser(url) {
  try {
    if (process.platform === "win32") {
      execSync(`start "" "${url}"`, { stdio: "ignore", shell: true });
    }
  } catch {
    console.log("URL:", url);
  }
}

function printMissing() {
  console.log("=== 不足している設定 ===\n");
  if (!accessToken) {
    console.log("SUPABASE_ACCESS_TOKEN");
    console.log(`  発行: ${links?.tokens ?? "https://supabase.com/dashboard/account/tokens"}`);
  }
  if (!gmailPass) {
    console.log("GMAIL_APP_PASSWORD");
    console.log(`  発行: ${links?.appPasswords ?? "https://myaccount.google.com/apppasswords"}`);
  }
  console.log("\n入力後に SETUP_全部.bat を再実行するか:");
  console.log("  npm run setup:all");
}

if (!projectRef) {
  console.error("NEXT_PUBLIC_SUPABASE_URL が未設定です");
  process.exit(1);
}

if (!accessToken || !gmailPass) {
  printMissing();
  if (links) {
    openBrowser(links.tokens);
    openBrowser(links.appPasswords);
  }
  process.exit(1);
}

upsertEnvLocal({
  NEXT_PUBLIC_APP_URL: appUrl,
  SHOP_NAME: shopName,
  CONTACT_EMAIL: contactEmail,
  GMAIL_USER: gmailUser,
  SUPABASE_ACCESS_TOKEN: accessToken,
  GMAIL_APP_PASSWORD: gmailPass,
  EMAIL_FROM: `${shopName} <${gmailUser}>`,
});
console.log("✓ .env.local に保存しました\n");

const authConfigUrl = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;
const templates = getSupabaseEmailTemplates();

const getRes = await fetch(authConfigUrl, {
  headers: { Authorization: `Bearer ${accessToken}` },
});

if (!getRes.ok) {
  console.error("設定取得失敗:", getRes.status, await getRes.text());
  process.exit(1);
}

const current = await getRes.json();
const redirects = new Set(String(current.uri_allow_list ?? "").split(",").map((s) => s.trim()).filter(Boolean));
redirects.add(`${appUrl}/auth/callback`);
redirects.add("http://localhost:3000/auth/callback");

const patchBody = {
  site_url: appUrl,
  uri_allow_list: [...redirects].join(","),
  hook_send_email_enabled: false,
  hook_send_email_uri: "",
  hook_send_email_secrets: "",
  external_email_enabled: true,
  mailer_autoconfirm: false,
  smtp_admin_email: gmailUser,
  smtp_host: "smtp.gmail.com",
  smtp_port: 587,
  smtp_user: gmailUser,
  smtp_pass: gmailPass,
  smtp_sender_name: shopName,
  rate_limit_email_sent: emailRateLimit,
  ...templates,
};

const patchRes = await fetch(authConfigUrl, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(patchBody),
});

if (!patchRes.ok) {
  console.error("一括設定失敗:", patchRes.status, await patchRes.text());
  if (links) openBrowser(links.smtp);
  process.exit(1);
}

const updated = await patchRes.json();

upsertEnvLocal({
  NEXT_PUBLIC_APP_URL: appUrl,
  SHOP_NAME: shopName,
  CONTACT_EMAIL: contactEmail,
  GMAIL_USER: gmailUser,
  SUPABASE_ACCESS_TOKEN: accessToken,
  GMAIL_APP_PASSWORD: gmailPass,
  EMAIL_FROM: `${shopName} <${gmailUser}>`,
});

console.log("=== Supabase メール設定 完了 ===\n");
console.log("✓ Send Email Hook : OFF");
console.log("✓ Gmail SMTP      : ON");
console.log("✓ Emails sent     :", updated.rate_limit_email_sent ?? emailRateLimit);
console.log("✓ Site URL        :", updated.site_url ?? appUrl);
console.log("✓ メールテンプレート : 反映済み");
console.log("\nテスト:");
console.log("  1.", links?.users, "で古いテストユーザーを削除");
console.log("  2.", links?.register, "で別メール登録");

if (links) openBrowser(links.hooks);

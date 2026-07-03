import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";
import { getShopNameFromEnv, getSupabaseEmailTemplates } from "./lib/email-templates.mjs";

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const shopName = getShopNameFromEnv();
const gmailUser = process.env.GMAIL_USER ?? "";
const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "") ?? "";
const emailRateLimit = Number(process.env.SUPABASE_EMAIL_RATE_LIMIT ?? "100");

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

const links = projectRef
  ? {
      hooks: `https://supabase.com/dashboard/project/${projectRef}/auth/hooks`,
      smtp: `https://supabase.com/dashboard/project/${projectRef}/auth/smtp`,
      rateLimits: `https://supabase.com/dashboard/project/${projectRef}/auth/rate-limits`,
      templates: `https://supabase.com/dashboard/project/${projectRef}/auth/templates`,
    }
  : null;

function openBrowser(url) {
  try {
    if (process.platform === "win32") {
      execSync(`start "" "${url}"`, { stdio: "ignore", shell: true });
    } else if (process.platform === "darwin") {
      execSync(`open "${url}"`);
    } else {
      execSync(`xdg-open "${url}"`);
    }
  } catch {
    console.log("URL:", url);
  }
}

function printManualSteps() {
  console.log("=== Supabase 標準メール（Gmail SMTP）に戻す手順 ===\n");
  console.log("Send Email Hook は OFF にしてください（これが原因で {} エラーになります）。\n");
  console.log("※ ダッシュボードで Delete が押せない場合:");
  console.log("  → 先に STEP 2 の Custom SMTP を ON にして Save");
  console.log("  → その後 STEP 1 で Hook を Delete\n");

  if (links) {
    console.log("【STEP 1】Hook を削除");
    console.log(`  ${links.hooks}`);
    console.log("  → Send Email の Hook を Delete / Disable\n");

    console.log("【STEP 2】Custom SMTP を ON（Gmail）");
    console.log(`  ${links.smtp}`);
    console.log("  Sender email : oripakawa@gmail.com");
    console.log("  Sender name  : ORIPA VAULT");
    console.log("  Host         : smtp.gmail.com");
    console.log("  Port         : 587");
    console.log("  Username     : oripakawa@gmail.com");
    console.log("  Password     : Gmail アプリパスワード（16文字）");
    console.log("  Minimum interval per user : 60\n");

    console.log("【STEP 3】Rate Limits → Emails sent = 100");
    console.log(`  ${links.rateLimits}\n`);

    console.log("【STEP 4】メールテンプレート（Confirm signup）");
    console.log(`  ${links.templates}`);
    console.log("  → SUPABASE_メール_コピペ用.txt の内容を貼る\n");
  }

  console.log("【STEP 5】Render から削除して OK");
  console.log("  SEND_EMAIL_HOOK_SECRET（Hook を使わないため不要）\n");

  console.log("【STEP 6】テスト");
  console.log("  Supabase → Authentication → Users でテストユーザーを削除");
  console.log("  別メールで https://online-oripa.onrender.com/register\n");

  console.log("自動反映: .env.local に以下を追加して再実行");
  console.log("  SUPABASE_ACCESS_TOKEN=sbp_...");
  console.log("  GMAIL_USER=oripakawa@gmail.com");
  console.log("  GMAIL_APP_PASSWORD=xxxx");
}

if (!projectRef) {
  console.error("NEXT_PUBLIC_SUPABASE_URL からプロジェクト ref を取得できません");
  process.exit(1);
}

if (!accessToken || !gmailUser || !gmailPass) {
  printManualSteps();
  if (links) {
    openBrowser(links.hooks);
    openBrowser(links.smtp);
  }
  process.exit(0);
}

const templates = getSupabaseEmailTemplates();
const authConfigUrl = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;

const res = await fetch(authConfigUrl, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    site_url: appUrl,
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
  }),
});

if (!res.ok) {
  console.error("SMTP 設定失敗:", res.status, await res.text());
  printManualSteps();
  if (links) openBrowser(links.hooks);
  process.exit(1);
}

console.log(`✓ Supabase Gmail SMTP を有効化しました（${shopName}）`);
console.log(`✓ Send Email Hook を OFF にしました`);
console.log(`✓ Emails sent 上限: ${emailRateLimit}`);
console.log(`✓ Site URL: ${appUrl}`);
console.log("\nSupabase Dashboard で Hook が残っていないか確認してください:");
if (links) console.log(`  ${links.hooks}`);

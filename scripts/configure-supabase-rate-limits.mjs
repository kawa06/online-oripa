import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const targetEmailLimit = Number(process.env.SUPABASE_EMAIL_RATE_LIMIT ?? "100");

const rateLimitsUrl = projectRef
  ? `https://supabase.com/dashboard/project/${projectRef}/auth/rate-limits`
  : "https://supabase.com/dashboard";

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
    console.log("ブラウザを開けませんでした。URL を手動で開いてください:", url);
  }
}

function printManualSteps() {
  console.log("=== Supabase Rate Limits（手動設定） ===\n");
  console.log(`1. 次のページを開く:\n   ${rateLimitsUrl}\n`);
  console.log(`2. 「Rate limit for sending emails」（Emails sent）を ${targetEmailLimit} に変更`);
  console.log("3. Save をクリック\n");
  console.log("自動反映する場合:");
  console.log("  https://supabase.com/dashboard/account/tokens で Access Token を発行");
  console.log("  .env.local に SUPABASE_ACCESS_TOKEN=sbp_... を追加");
  console.log("  npm run setup:rate-limits を再実行\n");
}

if (!projectRef) {
  console.error("NEXT_PUBLIC_SUPABASE_URL からプロジェクト ref を取得できません");
  process.exit(1);
}

if (!accessToken) {
  printManualSteps();
  openBrowser(rateLimitsUrl);
  process.exit(0);
}

const authConfigUrl = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;

const getRes = await fetch(authConfigUrl, {
  headers: { Authorization: `Bearer ${accessToken}` },
});

if (!getRes.ok) {
  console.error("現在の設定取得に失敗:", getRes.status, await getRes.text());
  printManualSteps();
  openBrowser(rateLimitsUrl);
  process.exit(1);
}

const current = await getRes.json();
const before = current.rate_limit_email_sent;
console.log(`現在の Emails sent 上限: ${before ?? "(未設定)"}`);

const patchRes = await fetch(authConfigUrl, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ rate_limit_email_sent: targetEmailLimit }),
});

if (!patchRes.ok) {
  console.error("Rate Limits 更新失敗:", patchRes.status, await patchRes.text());
  printManualSteps();
  openBrowser(rateLimitsUrl);
  process.exit(1);
}

const updated = await patchRes.json();
console.log(`✓ Emails sent 上限を ${updated.rate_limit_email_sent} に更新しました`);

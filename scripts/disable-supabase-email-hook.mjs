import { execSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

const hooksUrl = projectRef
  ? `https://supabase.com/dashboard/project/${projectRef}/auth/hooks`
  : "https://supabase.com/dashboard";

function openBrowser(url) {
  try {
    if (process.platform === "win32") {
      execSync(`start "" "${url}"`, { stdio: "ignore", shell: true });
    }
  } catch {
    console.log("URL:", url);
  }
}

function printManualSteps() {
  console.log("=== Send Email Hook を OFF にする ===\n");
  console.log("ダッシュボードで消せない場合:");
  console.log("  1. 先に Custom SMTP を ON にする（Auth → SMTP）");
  console.log("  2. Save してから Hook ページで Delete\n");
  console.log("手動:");
  console.log(`  ${hooksUrl}`);
  console.log("  → Send Email → Delete（または Disable）\n");
  console.log("自動で OFF:");
  console.log("  .env.local に SUPABASE_ACCESS_TOKEN=sbp_... を追加");
  console.log("  npm run setup:disable-hook");
}

if (!projectRef) {
  console.error("NEXT_PUBLIC_SUPABASE_URL からプロジェクト ref を取得できません");
  process.exit(1);
}

if (!accessToken) {
  printManualSteps();
  openBrowser(hooksUrl);
  process.exit(0);
}

const authConfigUrl = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;

const getRes = await fetch(authConfigUrl, {
  headers: { Authorization: `Bearer ${accessToken}` },
});

if (!getRes.ok) {
  console.error("設定取得失敗:", getRes.status, await getRes.text());
  printManualSteps();
  process.exit(1);
}

const current = await getRes.json();
console.log("現在の Hook:", current.hook_send_email_enabled ? "ON" : "OFF");

const patchRes = await fetch(authConfigUrl, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    hook_send_email_enabled: false,
    hook_send_email_uri: "",
    hook_send_email_secrets: "",
  }),
});

if (!patchRes.ok) {
  console.error("Hook OFF 失敗:", patchRes.status, await patchRes.text());
  console.log("\n→ 先に Custom SMTP を ON にしてから再実行してください。");
  printManualSteps();
  openBrowser(hooksUrl);
  process.exit(1);
}

const updated = await patchRes.json();
console.log("✓ Send Email Hook を OFF にしました");
console.log("  hook_send_email_enabled:", updated.hook_send_email_enabled);

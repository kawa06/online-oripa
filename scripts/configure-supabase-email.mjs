import { loadEnvLocal } from "./lib/load-env.mjs";
import { getShopNameFromEnv, getSupabaseEmailTemplates } from "./lib/email-templates.mjs";

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const shopName = getShopNameFromEnv();

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error("NEXT_PUBLIC_SUPABASE_URL からプロジェクト ref を取得できません");
  process.exit(1);
}

if (!accessToken) {
  console.log("=== Supabase メールテンプレート（手動設定用） ===\n");
  console.log("Supabase Dashboard → Authentication → Email Templates に以下を設定してください。\n");
  console.log("Project Settings → General → Project name:", shopName);
  console.log("Authentication → URL Configuration → Site URL:", appUrl);
  console.log("Redirect URLs:", `${appUrl}/auth/callback\n`);

  const templates = getSupabaseEmailTemplates();
  for (const [key, value] of Object.entries(templates)) {
    console.log(`--- ${key} ---`);
    console.log(value);
    console.log("");
  }

  console.log("自動反映する場合: https://supabase.com/dashboard/account/tokens で Access Token を発行し");
  console.log("SUPABASE_ACCESS_TOKEN=... を .env.local に追加して再実行してください。");
  process.exit(0);
}

const templates = getSupabaseEmailTemplates();

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    site_url: appUrl,
    ...templates,
  }),
});

if (!res.ok) {
  console.error("設定失敗:", res.status, await res.text());
  process.exit(1);
}

console.log(`✓ Supabase メールテンプレートを更新しました（${shopName}）`);
console.log(`✓ Site URL: ${appUrl}`);

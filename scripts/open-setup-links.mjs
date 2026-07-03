import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

function openUrl(url) {
  spawnSync("cmd", ["/c", "start", "", url], { stdio: "ignore", shell: true });
}

const generic = [
  { label: "Supabase ダッシュボード", url: "https://supabase.com/dashboard" },
  { label: "新規プロジェクト作成", url: "https://supabase.com/dashboard/new/new-project" },
  { label: "Stripe ダッシュボード（任意）", url: "https://dashboard.stripe.com/test/apikeys" },
  { label: "Resend API Keys（任意）", url: "https://resend.com/api-keys" },
  { label: "Vercel デプロイ（任意）", url: "https://vercel.com/new" },
];

const project = ref
  ? [
      { label: "API Keys（URL / anon / service_role）", url: `https://supabase.com/dashboard/project/${ref}/settings/api` },
      { label: "Database 接続文字列", url: `https://supabase.com/dashboard/project/${ref}/settings/database` },
      { label: "Auth → Email を ON", url: `https://supabase.com/dashboard/project/${ref}/auth/providers` },
      { label: "Auth → URL設定（Redirect）", url: `https://supabase.com/dashboard/project/${ref}/auth/url-configuration` },
      { label: "Storage バケット確認", url: `https://supabase.com/dashboard/project/${ref}/storage/buckets` },
      { label: "SQL Editor", url: `https://supabase.com/dashboard/project/${ref}/sql/new` },
    ]
  : [];

console.log("=== ORIPA VAULT 設定リンク ===\n");

if (ref) {
  console.log(`プロジェクト: ${ref}\n`);
  console.log("【このプロジェクト用リンク】");
  for (const item of project) {
    console.log(`  • ${item.label}`);
    openUrl(item.url);
  }
  console.log("");
} else {
  console.log("⚠ .env.local に NEXT_PUBLIC_SUPABASE_URL が未設定です");
  console.log("  汎用リンクのみ開きます。.env.local 設定後にもう一度実行してください。\n");
}

console.log("【共通リンク】");
for (const item of generic) {
  console.log(`  • ${item.label}`);
  openUrl(item.url);
}

const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  console.log("\n.env.local をメモ帳で開きます...");
  spawnSync("notepad", [envPath], { stdio: "ignore", shell: true });
} else {
  console.log("\n.env.local がありません → npm run setup:env を実行してください");
}

console.log("\nローカルアプリ:");
console.log("  http://localhost:3000");
console.log("  http://localhost:3000/register");
console.log("  http://localhost:3000/admin");

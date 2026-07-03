import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://online-oripa.onrender.com").replace(/\/$/, "");

function openUrl(url) {
  spawnSync("cmd", ["/c", "start", "", url], { stdio: "ignore", shell: true });
}

console.log("=== メール設定リンク ===\n");

const links = [
  {
    step: "1",
    label: "Supabase Token を発行（sbp_...）",
    url: "https://supabase.com/dashboard/account/tokens",
    required: true,
  },
  {
    step: "2",
    label: "Gmail アプリパスワード（16文字）",
    url: "https://myaccount.google.com/apppasswords",
    required: false,
  },
];

if (ref) {
  links.push(
    { step: "3", label: "Supabase → Custom SMTP", url: `https://supabase.com/dashboard/project/${ref}/auth/smtp` },
    { step: "4", label: "Supabase → Send Email Hook（OFF 確認）", url: `https://supabase.com/dashboard/project/${ref}/auth/hooks` },
    { step: "5", label: "Supabase → Rate Limits", url: `https://supabase.com/dashboard/project/${ref}/auth/rate-limits` },
    { step: "6", label: "Supabase → メールテンプレート", url: `https://supabase.com/dashboard/project/${ref}/auth/templates` },
    { step: "7", label: "登録テスト", url: `${appUrl}/register` },
  );
}

console.log("次の順番で作業してください:\n");
console.log("  A. [1] で Token を発行 → SETUP_Tokenだけ.bat に貼る");
console.log("  B. 設定後 [3]〜[6] で反映を確認");
console.log("  C. [7] で別メール登録テスト\n");

for (const item of links) {
  const mark = item.required ? "★" : "·";
  console.log(`  ${mark} [${item.step}] ${item.label}`);
  openUrl(item.url);
}

const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  console.log("\n.env.local をメモ帳で開きます（Token を貼る場合）...");
  spawnSync("notepad", [envPath], { stdio: "ignore", shell: true });
}

console.log("\nToken を貼ったら: SETUP_Tokenだけ.bat または ③設定を実行.bat");

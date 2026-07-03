import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";
import { getShopNameFromEnv } from "./lib/email-templates.mjs";

loadEnvLocal();

const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const gmailUser = process.env.GMAIL_USER ?? "oripakawa@gmail.com";
const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "") ?? "";
const shopName = getShopNameFromEnv();
const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://online-oripa.onrender.com").replace(/\/$/, "");

if (!ref) {
  console.error("NEXT_PUBLIC_SUPABASE_URL が未設定です");
  process.exit(1);
}

if (!gmailPass) {
  console.error("GMAIL_APP_PASSWORD が未設定です");
  process.exit(1);
}

const copyPath = join(process.cwd(), "SMTP_今すぐ貼る.txt");
const content = `============================================
 ORIPA VAULT — メール復旧（3分）
 Token 不要・以前動いていた方式
============================================

【やること】Supabase の画面でコピペして Save するだけ

============================================
 STEP 1: Custom SMTP を ON
  https://supabase.com/dashboard/project/${ref}/auth/smtp
============================================

Enable Custom SMTP : ON

Sender email     : ${gmailUser}
Sender name      : ${shopName}
Host             : smtp.gmail.com
Port number      : 587
Username         : ${gmailUser}
Password         : （.env.local の GMAIL_APP_PASSWORD をコピー）
Minimum interval : 60

→ Save をクリック

============================================
 STEP 2: Send Email Hook を OFF
  https://supabase.com/dashboard/project/${ref}/auth/hooks
============================================

Send Email の Hook があれば Delete（または Disable）

※ Delete が押せない場合:
  先に STEP 1 の SMTP を Save してから Delete

============================================
 STEP 3: Rate Limits
  https://supabase.com/dashboard/project/${ref}/auth/rate-limits
============================================

Emails sent : 100 → Save

============================================
 STEP 4: テスト
  ${appUrl}/register
  別のメールアドレスで登録
============================================

【補足】
- sbp_ トークンは不要
- Render の設定変更は不要
- 以前メールが届いていたのはこの方式です
`;

writeFileSync(copyPath, content, "utf8");
console.log("✓ SMTP_今すぐ貼る.txt を作成しました\n");

function openUrl(url) {
  spawnSync("cmd", ["/c", "start", "", url], { stdio: "ignore", shell: true });
}

console.log("ブラウザを開きます...");
openUrl(`https://supabase.com/dashboard/project/${ref}/auth/smtp`);
openUrl(`https://supabase.com/dashboard/project/${ref}/auth/hooks`);

const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  spawnSync("notepad", [envPath], { stdio: "ignore", shell: true });
}
spawnSync("notepad", [copyPath], { stdio: "ignore", shell: true });

console.log("\n.env.local から GMAIL_APP_PASSWORD をコピー");
console.log("Supabase SMTP 画面に貼って Save → Hook を Delete");

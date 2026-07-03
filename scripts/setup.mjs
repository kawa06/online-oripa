import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { loadEnvLocal } from "./lib/load-env.mjs";

function run(cmd, args) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: true, env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("=== ORIPA VAULT セットアップ ===\n");

run("node", ["scripts/setup-env.mjs"]);

loadEnvLocal();

const envPath = join(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
  console.error(".env.local が必要です");
  process.exit(1);
}

run("node", ["scripts/sync-env.mjs"]);

run("npm", ["run", "db:generate"]);

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || dbUrl.includes("[password]") || dbUrl.includes("YOUR_PROJECT") || dbUrl.includes("[ref]")) {
  console.log("\n⚠ DATABASE_URL が未設定のため db:push / db:seed をスキップしました");
  console.log("  .env.local に DB 接続情報を入れたら:");
  console.log("  npm run db:push && npm run db:seed");
} else {
  run("npm", ["run", "db:push"]);
  run("npm", ["run", "db:seed"]);
}

run("node", ["scripts/setup-storage.mjs"]);

console.log("\n=== セットアップ完了 ===");
console.log("次: npm run dev  または  起動.bat");

import { copyFileSync, existsSync } from "fs";
import { join } from "path";

const root = process.cwd();
const envPath = join(root, ".env.local");
const examplePath = join(root, ".env.local.example");

if (existsSync(envPath)) {
  console.log("✓ .env.local は既に存在します（スキップ）");
} else if (existsSync(examplePath)) {
  copyFileSync(examplePath, envPath);
  console.log("✓ .env.local.example から .env.local を作成しました");
  console.log("→ .env.local を開いて Supabase / DB の値を入力してください");
} else {
  console.error("✗ .env.local.example が見つかりません");
  process.exit(1);
}

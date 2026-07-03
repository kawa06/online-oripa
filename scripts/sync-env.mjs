import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const keys = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const lines = ["# Auto-generated from .env.local — do not edit manually"];
for (const key of keys) {
  const value = process.env[key];
  if (value) lines.push(`${key}="${value}"`);
}

const envPath = join(process.cwd(), ".env");
if (!existsSync(join(process.cwd(), ".env.local"))) {
  console.error(".env.local がありません");
  process.exit(1);
}

writeFileSync(envPath, lines.join("\n") + "\n", "utf8");
console.log("✓ .env.local → .env に同期しました（Prisma 用）");

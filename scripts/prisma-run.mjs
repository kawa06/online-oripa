import { spawnSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/prisma-run.mjs <prisma args...>");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);

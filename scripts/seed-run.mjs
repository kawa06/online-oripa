import { spawnSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const result = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);

import { spawnSync } from "child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

spawnSync("node", ["scripts/sync-env.mjs"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

const result = spawnSync("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);

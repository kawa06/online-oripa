import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || key.includes("your-service-role")) {
  console.log("⊘ Storage セットアップをスキップ（SUPABASE_SERVICE_ROLE_KEY 未設定）");
  console.log("  開発中は public/uploads/ に自動保存されます");
  process.exit(0);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const bucket = "uploads";

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("✗ バケット一覧取得失敗:", listError.message);
  process.exit(1);
}

if (buckets?.some((b) => b.name === bucket)) {
  console.log(`✓ Storage バケット "${bucket}" は既に存在します`);
} else {
  const { error } = await supabase.storage.createBucket(bucket, { public: true });
  if (error) {
    console.error("✗ バケット作成失敗:", error.message);
    process.exit(1);
  }
  console.log(`✓ Storage バケット "${bucket}" を作成しました（public）`);
}

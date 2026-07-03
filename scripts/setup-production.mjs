import { loadEnvLocal } from "./lib/load-env.mjs";
import { PrismaClient } from "@prisma/client";

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL ?? "oripakawa@gmail.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "Kawakai0609";
const redirectUrl = "https://online-oripa.onrender.com/auth/callback";
const siteUrl = "https://online-oripa.onrender.com";

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const prisma = new PrismaClient();

async function createOrGetAdminUser() {
  const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
  });

  if (listRes.ok) {
    const body = await listRes.json();
    const users = body.users ?? body;
    const existing = Array.isArray(users)
      ? users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase())
      : null;
    if (existing) {
      console.log(`✓ Supabase user exists: ${adminEmail}`);
      return existing;
    }
  }

  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { display_name: "Admin" },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Create user failed: ${createRes.status} ${err}`);
  }

  const user = await createRes.json();
  console.log(`✓ Created Supabase admin user: ${adminEmail}`);
  return user;
}

async function upsertAdminProfile(userId, email) {
  await prisma.profile.upsert({
    where: { id: userId },
    update: { role: "ADMIN", email },
    create: {
      id: userId,
      email,
      displayName: "Admin",
      role: "ADMIN",
      points: 100000,
    },
  });
  console.log("✓ Prisma profile set to ADMIN");
}

async function patchAuthConfig() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!token || !ref) {
    console.log("⚠ SUPABASE_ACCESS_TOKEN 未設定 → Redirect URL は手動設定が必要");
    console.log(`  追加: ${redirectUrl}`);
    return false;
  }

  const getRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!getRes.ok) {
    console.log("⚠ Auth config fetch failed → Redirect URL は手動設定");
    return false;
  }

  const config = await getRes.json();
  const redirects = new Set(config.uri_allow_list ?? []);
  redirects.add(redirectUrl);
  redirects.add("http://localhost:3000/auth/callback");

  const patchRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      site_url: siteUrl,
      uri_allow_list: [...redirects].join(","),
    }),
  });

  if (!patchRes.ok) {
    console.log("⚠ Auth config patch failed → Redirect URL は手動設定");
    return false;
  }

  console.log("✓ Supabase Auth redirect URL configured");
  return true;
}

try {
  console.log("=== Production admin setup ===\n");
  const user = await createOrGetAdminUser();
  await upsertAdminProfile(user.id, adminEmail);
  await patchAuthConfig();

  console.log("\n=== Done ===");
  console.log(`Site:  ${siteUrl}`);
  console.log(`Admin: ${siteUrl}/admin`);
  console.log(`Login: ${adminEmail}`);
  console.log(`Pass:  ${adminPassword}`);
  console.log("\nChange password after first login.");
  console.log("\nメール文面を反映: npm run setup:email");
  console.log("（Supabase の Project name を SHOP_NAME と同じにしてください）");
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}

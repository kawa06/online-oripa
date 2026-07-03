import "server-only";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import type { UserRole } from "@prisma/client";

async function syncLastIp(userId: string, currentIp: string | null) {
  if (!currentIp) return;
  await prisma.profile.updateMany({
    where: { id: userId, NOT: { lastIp: currentIp } },
    data: { lastIp: currentIp },
  });
}

export async function getSessionProfile() {
  const user = await getUser();
  if (!user?.email) return null;

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (profile) {
    await syncLastIp(user.id, ip).catch(() => null);
    return profile;
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const role: UserRole =
    user.email.toLowerCase() === adminEmail ? "ADMIN" : "USER";

  const created = await prisma.profile.create({
    data: {
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.display_name ?? user.email.split("@")[0],
      role,
      points: role === "ADMIN" ? 100000 : 1000,
      lastIp: ip,
    },
  });
  return created;
}

export async function requireProfile() {
  const profile = await getSessionProfile();
  if (!profile) throw new Error("Unauthorized");
  return profile;
}

export async function requireAdmin() {
  const profile = await requireProfile();
  if (profile.role !== "ADMIN") throw new Error("Forbidden");
  return profile;
}

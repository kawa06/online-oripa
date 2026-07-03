import "server-only";

import { prisma } from "@/lib/prisma";

export type FraudAlert = {
  userId: string;
  email: string;
  type: "SHARED_IP" | "HIGH_VELOCITY" | "MULTI_ACCOUNT_IP";
  severity: "low" | "medium" | "high";
  message: string;
};

export async function detectFraudAlerts(limit = 50): Promise<FraudAlert[]> {
  const alerts: FraudAlert[] = [];

  const profiles = await prisma.profile.findMany({
    where: { lastIp: { not: null } },
    select: { id: true, email: true, lastIp: true, createdAt: true },
    take: 500,
  });

  const ipMap = new Map<string, typeof profiles>();
  for (const p of profiles) {
    if (!p.lastIp) continue;
    const list = ipMap.get(p.lastIp) ?? [];
    list.push(p);
    ipMap.set(p.lastIp, list);
  }

  for (const [ip, users] of ipMap) {
    if (users.length < 2) continue;
    for (const u of users) {
      alerts.push({
        userId: u.id,
        email: u.email,
        type: "MULTI_ACCOUNT_IP",
        severity: users.length >= 3 ? "high" : "medium",
        message: `同一IP (${ip}) から ${users.length} アカウントを検出`,
      });
    }
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentPulls = await prisma.gachaPull.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: dayAgo } },
    _count: { id: true },
    _sum: { totalCost: true },
  });

  for (const row of recentPulls) {
    if ((row._count.id ?? 0) >= 50 || (row._sum.totalCost ?? 0) >= 100000) {
      const user = profiles.find((p) => p.id === row.userId);
      if (!user) continue;
      alerts.push({
        userId: user.id,
        email: user.email,
        type: "HIGH_VELOCITY",
        severity: "high",
        message: `24時間で ${row._count.id} 回 / ${(row._sum.totalCost ?? 0).toLocaleString()} pt 消費`,
      });
    }
  }

  return alerts.slice(0, limit);
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPoints } from "@/lib/utils";

export default async function AdminUsersPage() {
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  }).catch(() => []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">ユーザー管理</h1>
      <div className="card-surface table-scroll">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-elevated text-left text-muted">
            <tr>
              <th className="p-3">メール</th>
              <th className="p-3">表示名</th>
              <th className="p-3">ロール</th>
              <th className="p-3">Pコイン枚数</th>
              <th className="p-3">登録日</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/50">
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.displayName ?? "—"}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{formatPoints(u.points)}</td>
                <td className="p-3 text-xs text-muted">
                  {u.createdAt.toLocaleDateString("ja-JP")}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/users/${u.id}`} className="text-gold hover:underline">
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

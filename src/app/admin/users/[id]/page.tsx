import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserDetailPanel } from "@/components/admin/UserDetailPanel";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.profile.findUnique({ where: { id } });
  if (!user) notFound();

  const transactions = await prisma.pointTransaction.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">ユーザー詳細</h1>
      <UserDetailPanel user={user} transactions={transactions} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { AnnouncementManager } from "@/components/admin/AnnouncementManager";

export default async function AdminAnnouncementsPage() {
  const items = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">お知らせ管理</h1>
      <AnnouncementManager items={items} />
    </div>
  );
}

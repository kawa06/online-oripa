import { prisma } from "@/lib/prisma";
import { BannerManager } from "@/components/admin/BannerManager";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">バナー管理</h1>
      <BannerManager banners={banners} />
    </div>
  );
}

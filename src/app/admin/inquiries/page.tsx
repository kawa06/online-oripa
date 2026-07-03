import { prisma } from "@/lib/prisma";
import { InquiriesManager } from "@/components/admin/InquiriesManager";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  }).catch(() => []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">お問い合わせ</h1>
      <InquiriesManager inquiries={inquiries} />
    </div>
  );
}

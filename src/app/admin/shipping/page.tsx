import { prisma } from "@/lib/prisma";
import { ShippingManager } from "@/components/admin/ShippingManager";

export default async function AdminShippingPage() {
  const requests = await prisma.shippingRequest
    .findMany({
      include: {
        user: { select: { email: true, displayName: true } },
        items: {
          include: {
            userWin: { select: { name: true, rank: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    .catch(() => []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">発送管理</h1>
      <ShippingManager requests={requests} />
    </div>
  );
}

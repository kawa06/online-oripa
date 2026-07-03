import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/CouponManager";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">クーポン管理</h1>
      <CouponManager coupons={coupons} />
    </div>
  );
}

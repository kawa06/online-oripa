import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sales = await prisma.pointTransaction.findMany({
    where: { type: "PURCHASE", amount: { gt: 0 } },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = "日時,ユーザー,金額,説明,Stripe Session ID\n";
  const rows = sales
    .map((s) =>
      [
        s.createdAt.toISOString(),
        s.user.email,
        s.amount,
        `"${(s.description ?? "").replace(/"/g, '""')}"`,
        s.stripeSessionId ?? "",
      ].join(",")
    )
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}


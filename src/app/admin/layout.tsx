import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

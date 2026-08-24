import { requireAdmin } from "@/lib/admin";
import { AdminLayoutClient } from "./admin-layout-client";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await requireAdmin();

  return (
    <AdminLayoutClient adminUser={adminUser}>
      {children}
    </AdminLayoutClient>
  );
}

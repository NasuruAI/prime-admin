import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { getStoreName } from "@/lib/config";
import { getSession } from "@/lib/session";

// Auth guard (defence-in-depth; middleware already gates the app to admins).
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/login");

  const storeName = await getStoreName();

  return (
    <AdminShell email={user.email} storeName={storeName}>
      {children}
    </AdminShell>
  );
}

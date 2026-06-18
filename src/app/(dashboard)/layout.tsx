import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
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

  return <AdminShell email={user.email}>{children}</AdminShell>;
}

import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { ToastProvider } from "@/components/ui/toast";
import { getStoreLogoUrl, getStoreName } from "@/lib/config";
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

  const [storeName, logoUrl] = await Promise.all([
    getStoreName(),
    getStoreLogoUrl(),
  ]);

  return (
    <ToastProvider>
      <AdminShell email={user.email} storeName={storeName} logoUrl={logoUrl}>
        {children}
      </AdminShell>
    </ToastProvider>
  );
}

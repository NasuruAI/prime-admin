import { SuppliersAdmin } from "@/features/admin/suppliers-admin";

export const metadata = { title: "Suppliers" };

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Suppliers</h1>
      <SuppliersAdmin />
    </div>
  );
}

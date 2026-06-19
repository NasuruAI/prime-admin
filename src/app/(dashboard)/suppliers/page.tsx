import { SuppliersAdmin } from "@/features/admin/suppliers-admin";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Suppliers" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Dropshipping"
        title="Suppliers"
      />
      <SuppliersAdmin />
    </div>
  );
}

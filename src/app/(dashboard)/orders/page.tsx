import { OrdersAdmin } from "@/features/admin/orders-admin";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Orders" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Sales"
        title="Orders"
      />
      <OrdersAdmin />
    </div>
  );
}

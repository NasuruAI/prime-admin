import { OrdersAdmin } from "@/features/admin/orders-admin";

export const metadata = { title: "Orders" };

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Orders</h1>
      <OrdersAdmin />
    </div>
  );
}

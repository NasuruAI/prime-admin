import { CouponsAdmin } from "@/features/admin/coupons-admin";

export const metadata = { title: "Coupons" };

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Coupons</h1>
      <CouponsAdmin />
    </div>
  );
}

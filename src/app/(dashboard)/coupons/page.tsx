import { CouponsAdmin } from "@/features/admin/coupons-admin";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Coupons" };

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Promotions"
        title="Coupons"
      />
      <CouponsAdmin />
    </div>
  );
}
